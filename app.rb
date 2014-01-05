require 'bundler'
Bundler.require

module VideoSync
  class App < Sinatra::Application
    get '/' do
      haml :index
    end

    get '/help' do
    end

    get '/start' do
      @link = SecureRandom.hex
      haml :start
    end

    post '/video/:id' do
      redis = Redis.new
      @video = /.*\=(.*)\&?/.match(params["video"])[1]
      redis.set(params[:id], @video)
      @identity = "controller"
      @link = params[:id]
      haml :room
    end

    get '/video/:id' do
      redis = Redis.new
      @video = redis.get(params[:id])
      @nocontrols = "&controls=0"
      haml :room
    end

    helpers do
      def partial(partial)
        haml partial.to_sym
      end
    end
  end
end