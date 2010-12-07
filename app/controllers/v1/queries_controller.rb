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
    if @query.has_parameters?
      render :json => {:parameters => @query.parameters}
    else  
      render_query(@query, true)
    end
  end

  def run
    @query = Query.find(params[:id])
    if @query.query == params[:query]
      render_query(@query, true)
    else
      @query.query = params[:query]
      render_query(@query, false)
    end
  end

  def data
    @query = Query.find(params[:id])
    render :json => @query
  end

  def preview
    @query = Query.new(params[:query])
    render_query(@query, false)
  end

  private

  def render_query(query, use_cache)
    respond_to do |f|
      f.json { render :text => query.json(use_cache) }
      f.xml  { render :text => query.xml(use_cache)  }
    end
  end
end
