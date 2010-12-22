require 'digest/sha2'
require 'net/http'
require 'uri'
require 'cgi'
require 'open-uri'

class Query < ActiveRecord::Base
  MAX_HASH_LENGTH = 10
  has_friendly_id  :query, :use_slug => true, :strip_non_ascii => true
  PARAMETER_REGEX = /=\w+=/

  validates_presence_of :source
  validates_presence_of :query

  def normalize_friendly_id(text)
    hash = Digest::SHA2.new << text
    hash.to_s
  end

  def has_parameters?
    query =~ PARAMETER_REGEX
  end

  def parameters
    query.scan(PARAMETER_REGEX).map {|p| p[1...-1] }
  end

  def substitute_parameters(params)
    parameters.each do |p|
      query.gsub!(/=#{p}=/, params[p]) if params[p]
    end
    Rails.logger.info("Substituted parameters, generated query #{query}")
  end

  def has_xslt?
    !(xslt_path.blank? && xslt_sheet.blank?)
  end

  def xslt_mime_type
    case xslt_type
      when "json"
        "text/json"
      when "html"
        "text/html"
      when "text"
        "text/plain"
      else
        "text/html"
    end
  end

  def apply_xslt(xml)
    sheet = xslt_sheet.blank? ? open(xslt_path) : xslt_sheet 
    doc = Nokogiri::XML(xml)
    sheet = Nokogiri::XSLT(sheet)
    sheet.transform(doc) 
  end

  def run(use_cache)
    if has_xslt?
      apply_xslt(xml(use_cache))
    else
      json(use_cache)
    end
  end

  def send_query(mime_type)
    Rails.logger.info("Querying #{source} with #{query}")
    url = URI.parse(source)
    http = Net::HTTP.new(url.host, url.port)
    http.post(url.path, "query=#{CGI.escape(query)}", {"Accept" => mime_type}).body
  end

  def json(use_cache = false)
    if cache_json && use_cache
      Rails.logger.info("Returning cached json result")
      return cache_json
    else
      self.cache_json = send_query("application/sparql-results+json")
      save! if use_cache
      return cache_json
    end
  end

  def xml(use_cache = false)
    if cache_xml && use_cache
      Rails.logger.info("Returning cached XML result")
      return cache_xml
    else
      self.cache_xml = send_query("application/sparql-results+xml")
      save! if use_cache
      return cache_xml
    end
  end
end
