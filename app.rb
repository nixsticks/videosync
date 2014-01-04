require 'bundler'
Bundler.require

module VideoSync
  class App < Sinatra::Application
    get '/' do
      haml :index
    end
  end
end