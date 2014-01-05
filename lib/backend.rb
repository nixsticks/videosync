require 'faye/websocket'
require 'thread'

class Backend
  KEEPALIVE_TIME = 15

  MUTEX = Mutex.new

  def initialize(app)
    @app = app
    @clients = []
  end

  def call(env)
    if Faye::WebSocket.websocket?(env)
      ws = Faye::WebSocket.new(env, nil, {ping: KEEPALIVE_TIME})

      ws.on :open do |event|
        p [:open, ws.object_id]
        MUTEX.synchronize {@clients << ws}
      end

      ws.on :message do |event|
        p [:message, event.data]
        @clients.each {|client| client.send(event.data) }
      end

      ws.on :close do |event|
        p [:close, ws.object_id, event.code, event.reason]
        MUTEX.synchronize {@clients.delete(ws)}
        ws = nil
      end

      ws.rack_response
    else
      @app.call(env)
    end
  end
end