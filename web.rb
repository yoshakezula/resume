require 'sinatra'
require 'sinatra/reloader' if development?
require 'rack/coffee'

use Rack::Coffee, root: 'public', urls: '/javascripts'

get '/' do
	erb :resume
end
