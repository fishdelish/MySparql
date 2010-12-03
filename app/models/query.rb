require 'digest/sha2'
require 'net/http'
require 'uri'
require 'cgi'

class Query < ActiveRecord::Base
  MAX_HASH_LENGTH = 10
  has_friendly_id  :query, :use_slug => true, :strip_non_ascii => true

  validates_presence_of :source
  validates_presence_of :query

  def normalize_friendly_id(text)
    hash = Digest::SHA2.new << text
    hash.to_s
  end

  def run(mime_type)
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
      self.cache_json = run("application/sparql-results+json")
      save! if use_cache
      return cache_json
    end
  end

  def xml(use_cache = false)
    if cache_xml && use_cache
      Rails.logger.info("Returning cached XML result")
      return cache_xml
    else
      self.cache_xml = run("application/sparql-results+xml")
      save! if use_cache
      return cache_xml
    end
  end
end
