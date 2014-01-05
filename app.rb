require 'bundler'
Bundler.require

module VideoSync
  class App < Sinatra::Application
    get '/' do
      @link = SecureRandom.urlsafe_base64(5)
      haml :index
    end

    get '/about' do
      haml :about
    end

    get '/help' do
      haml :help
    end

    post '/video/:id' do
      redis = redis_connect
      @video = /.*\=(.*)\&?/.match(params["video"])[1]
      redis.set(params[:id], @video)
      @identity = "controller"
      @link = params[:id]
      if @video
        haml :room
      else
        haml :not_found
      end
    end

    get '/video/:id' do
      redis = redis_connect
      @video = redis.get(params[:id])
      @nocontrols = "&controls=0"
      @link = params[:id]
      haml :room
    end

    helpers do
      def partial(partial)
        haml partial.to_sym
      end

      def redis_connect
        uri = URI.parse(ENV["REDISTOGO_URL"])
        Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
      end
    end
  end
end