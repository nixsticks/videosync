var scheme     = "ws://";
var uri        = scheme + window.document.location.host + "/faye";
var ws         = new WebSocket(uri);
var identity = $(".hidden").text();
var ytplayer;

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

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if (data == "PLAYING") {
    ytplayer.playVideo();
  }
  else if (data == "ENDED" || data == "PAUSED" || data == "BUFFERING") {
    ytplayer.pauseVideo();
  }
  else {
    time = ytplayer.getCurrentTime();
    if (Math.abs(time - data) > 1 || time == undefined) {
      ytplayer.seekTo(data, true);
    }
  }
};