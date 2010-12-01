class V1::QueriesController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    @query = Query.create!(params[:query])
    render :json => {:mysparql_id => @query.to_param}
  rescue ActiveRecord::RecordInvalid => invalid
    render :json => {:error => invalid.record.errors.full_messages}, :status => 400
  end

  def show
    @query = Query.find(params[:id])
    render_query(@query)
  end

  def run
    @query = Query.find(params[:id])
    @query.query = params[:query]
    render_query(@query)
  end

  def data
    @query = Query.find(params[:id])
    render :json => @query
  end

  def preview
    @query = Query.new(params[:query])
    render_query(@query)
  end

  private

  def render_query(query)
    results_hash = process_results(query.run)
    render :json => {:variables => results_hash.collect(&:keys).flatten.uniq, :results => results_hash}
  end

  def process_results(results)
    results.map(&:to_hash).map do |r|
      r.keys.inject({}) {|hsh, k| hsh[k] = r[k].to_s; hsh }
    end
  end
end
