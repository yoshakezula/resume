require 'rubygems'
require 'bundler'
Bundler.require(:default)
require 'sass/plugin/rack'
require 'rack/coffee'
require './web'

# use coffeescript for javascript
use Rack::Coffee, root: 'public', urls: '/javascripts'

configure :development do
  use Rack::Reloader

  # use scss for stylesheets
  Sass::Plugin.options[:style] = :compressed
  use Sass::Plugin::Rack
end

run Sinatra::Application