class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :default_format

  protected

  def default_format
    request.format = :json unless params[:format]
  end
end
