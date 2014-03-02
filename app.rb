require 'bundler'
Bundler.require

module VideoSync
  class App < Sinatra::Application
    Sinatra::register Gon::Sinatra

    redis = Redis.new

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
      match = /.*\=(.*)\&?/.match(params["video"])
      if match
        @video = match[1]
        redis.set(params[:id], @video)
        @identity, @link = "controller", params[:id]
        gon.identity = @identity
        haml :room
      else
        haml :not_found
      end
    end

    get '/video/:id' do
      @video = redis.get(params[:id])
      if @video
        @link = params[:id]
        haml :room
      else
        haml :not_found
      end
    end

    helpers do
      def partial(partial)
        haml partial.to_sym
      end

      # def redis
      #   uri = URI.parse(ENV["REDISTOGO_URL"])
      #   Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
      # end
    end
  end
end