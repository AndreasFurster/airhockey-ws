var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var waitingRoom = null;

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('request play', function() {
    console.log('Player requested to play. Socket id: ' + socket.id);
    io.to(socket.id).emit('message', 'Thank you for playing. You are in the queue. Waiting for another player...');

    if(!waitingRoom) {
      waitingRoom = Date.now();
    }

    socket.join(waitingRoom);

    var players = io.sockets.adapter.rooms[waitingRoom].length;
    if(players >= 2) {
      var roomId = waitingRoom;

      setTimeout(() => io.to(roomId).emit('message', 'Playing in... 5'), 1000);
      setTimeout(() => io.to(roomId).emit('message', 'Playing in... 4'), 2000);
      setTimeout(() => io.to(roomId).emit('message', 'Playing in... 3'), 3000);
      setTimeout(() => io.to(roomId).emit('message', 'Playing in... 2'), 4000);
      setTimeout(() => io.to(roomId).emit('message', 'Playing in... 1'), 5000);
      setTimeout(() => io.to(roomId).emit('message', 'Start!'), 6000);
      setTimeout(() => io.to(roomId).emit('start match', roomId), 7000);
      
      console.log('Match started: ' + roomId);
    
      waitingRoom = null;
    }
  });

  socket.on('paddle movement', function(data){
    socket.to(data.matchId).emit('paddle movement', data.position);
  });
});

http.listen(PORT, function(){
  console.log('listening on *:3000');
});