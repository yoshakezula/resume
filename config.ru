require 'rubygems'
require 'bundler'
Bundler.require(:default)
require 'sass/plugin/rack'
require 'rack/coffee'
require './web'

use Rack::Reloader

set :environment, :production
#set :run, false

# use scss for stylesheets
Sass::Plugin.options[:style] = :compressed
use Sass::Plugin::Rack

# use coffeescript for javascript
use Rack::Coffee, root: 'public', urls: '/javascripts'

run Sinatra::Application
#run MyApp