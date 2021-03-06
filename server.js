'use strict';
var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))
app.get('/chat.js', function(req, res) {
  res.send('chat.js');
})

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var clients = [];
var history = [];

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection", function(ws) {
  var clindex = clients.push(ws);
  let histmsg = {
    type : "history",
    history
  }
  let histjson = JSON.stringify(histmsg);
  ws.send(histjson)
  console.log("websocket connection open")
  ws.on("message",function(msg){
    console.log('message: ',msg);
    var ms;
    try{
      ms = JSON.parse(msg)
    }catch(e){
      ms = {};
      return;
    }
    history.push(ms);
    history = history.slice(-100);
    for(let i=0;i<clients.length;i++){
      let client = clients[i];
      try{
        client.send(msg);
      }catch(e){
        console.log('CLIENT EXCEPTION');
        clients.splice(i,1);
        i--;
      }
    }

  })
  ws.on("close", function() {
    console.log("websocket connection close")
    clients.splice(clindex,1)
  })
})
