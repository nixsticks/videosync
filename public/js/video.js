var scheme     = "wss://";
var uri        = scheme + window.document.location.host + "/faye";
var ws         = new WebSocket(uri);
var identity = $(".hidden").text();
var ytplayer;
var handle;

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
  function updateTime() {
    if (identity == "controller") {
      time = ytplayer.getCurrentTime();
      ws.send(JSON.stringify(time));
    }
  }
  setInterval(updateTime, 3000);
}

function onytplayerStateChange(newState) {
  var state;
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
  console.log("Player's new state: " + state);
  if (identity == "controller") {
    ws.send(JSON.stringify(state));
  }
}

$("#handle-form").on("submit", function(event){
  event.preventDefault();
  handle = $("#input-handle")[0].value;
  $("#handle-form").addClass("inactive");
  $("#chat-form").removeClass("inactive");
});

$("#chat-form").on("submit", function(event) {
  event.preventDefault();
  var text   = $("#input-text")[0].value;
  ws.send(JSON.stringify({ handle: handle, text: text }));
  $("#input-text")[0].value = "";
});

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  console.log(data);
  if (data == "PLAYING") {
    ytplayer.playVideo();
  }
  else if (data == "ENDED" || data == "PAUSED" || data == "BUFFERING") {
    ytplayer.pauseVideo();
  }
  else if (typeof data === ("object")) {
    $("#chat-text").append("<p>" + data.handle + ": " + data.text + "</p>");
    // $("#chat-text").prepend("<div class='panel panel-default'><div class='panel-heading'>" + data.handle + "</div><div class='panel-body'>" + data.text + "</div></div>");
    $("#chat-text").stop().animate({
      scrollTop: $('#chat-text')[0].scrollHeight
    }, 800);
  }
  else {
    time = ytplayer.getCurrentTime();
    if (Math.abs(time - data) > 1 || time == undefined) {
      ytplayer.seekTo(data, true);
    }
  }
};