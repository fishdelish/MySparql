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

  def update
    @query = Query.find(params[:id])
    @query.update_attributes(params[:query])
    @query.save!
    render :json => {:mysparql_id => @query.to_param}
  rescue ActiveRecord::RecordInvalid => invalid
    render :json => {:error => invalid.record.errors.full_messages}, :status => 400
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
    if @query.has_parameters?
      @query.substitute_parameters(params)
      Rails.logger.info("Generating preview query #{@query.query}")
      if @query.has_parameters?
        render :json => {:parameters => @query.parameters}
      else
        render_query(@query, false)
      end
    else
      render_query(@query, false)
    end
  end

  def param_query
    @query = Query.find(params[:id])
    @query.substitute_parameters(params)
    render_query(@query, false)
  end

  def param_data
    @query = Query.find(params[:id])
    @query.substitute_parameters(params)
    render :json => @query
  end

  private

  def render_query(query, use_cache)
    send_data query.run(use_cache)
  end
end
