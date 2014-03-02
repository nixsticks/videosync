var scheme     = "wss://";
var uri        = scheme + window.document.location.host + "/faye";
var ws         = new WebSocket(uri);
var room       = location.pathname;
var identity   = $(".player").data("identity");
var clip       = new ZeroClipboard(document.getElementById("copy-button"), { moviePath: "/js/ZeroClipboard.swf" } );
var ytplayer;
var handle = "Anonymous";

clip.on( "load", function(client) {
  client.on( "complete", function(client, args) {
    this.style.display = "none";
  });
});

$(window).unload(function() {
  ws.send(JSON.stringify({content: handle, command: "leave", room: room}));
});

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
  function updateTime() {
    if (identity === "controller") {
      time = ytplayer.getCurrentTime();
      status = ytplayer.getPlayerState();
      ws.send(JSON.stringify({content: time, status: status, command: "time", room: room}));
    }
  }
  setInterval(updateTime, 1000);
}

function onytplayerStateChange(newState) {
  var state = states[newState]
  switch(newState) {
    case -1:
      state = "UNSTARTED";
      break;
    case 0:
      state = "ENDED";
      break;
    case 1:
      state = "PLAYING";
      break;
    case 2:
      state = "PAUSED";
      break;
    case 3:
      state = "BUFFERING";
      break;
    case 5:
      state = "CUED";
      break;
  }

  if (identity === "controller") {
    ws.send(JSON.stringify({content: state, command: "state", room: room}));
  }
}

$("#handle-form").on("submit", function(event){
  event.preventDefault();
  handle = $("#input-handle")[0].value;
  $("#handle-form").addClass("inactive");
  $("#chat-form").removeClass("inactive");
  ws.send(JSON.stringify({content: handle, command: "handle", room: room}));
});

$("#chat-form").on("submit", function(event) {
  event.preventDefault();
  var text   = $("#input-text")[0].value;
  ws.send(JSON.stringify({ handle: handle, text: text, command: "chat", room: room }));
  $("#input-text")[0].value = "";
});

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);

  if (data.room === room) {
    switch(data.command) {
      case "state":
        if (identity !== "controller") {
          if (data.content === "PLAYING") { ytplayer.playVideo(); }
          else if (data.content === "ENDED" || data.content === "PAUSED" || data.content === "BUFFERING") { ytplayer.pauseVideo(); };
        }
        break;
      case "time":
        if (identity !== "controller") {
          if (data.status !== 1) { ytplayer.pauseVideo(); }
          time = ytplayer.getCurrentTime();
          if (Math.abs(time - data.content) > 1 || time === undefined) {
            ytplayer.seekTo(data.content, true);
          };
        }
        break;
      case "handle":
        appendHandle(htmlEscape(data.content), "joined");
        animateScroll();
        break;
      case "leave":
        appendHandle(htmlEscape(data.content), "left");
        animateScroll();
        break;
      case "chat":
        $("#chat-text").append("<p>" + htmlEscape(data.handle) + ": " + data.text + "</p>");
        animateScroll();
        break;
    }
  }

  function appendHandle(handle, action) {
    $("#chat-text").append("<p><em>" + handle + " " + action + " room" + "</em></p>");
  }

  function animateScroll() {
    $("#chat-text").stop().animate({
      scrollTop: $('#chat-text')[0].scrollHeight
    }, 800);
  }
};