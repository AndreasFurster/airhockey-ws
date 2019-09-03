var socket;
var playerId;
var inQueue = false;
var serverMessage = '';
var matchId = '';

const ballDiameter = 50;
const paddleWidth = 200;
const paddleHeight = 15;
const paddleSpeed = 10;
const winCount = 20;

const fieldWidth = 1100;
const fieldHeight = 900;

var started = false;
var lives = 10;
var gameover = false;
var won = false;

var roundStarted = false;

var xBall;
var yBall;

var xBallChange = 0;
var yBallChange = 10;

var xPlayerPaddle;
var yPlayerPaddle;
var xOpponentPaddle;
var yOpponentPaddle;

function setup() {
  createCanvas(fieldWidth, fieldHeight);

  xPlayerPaddle = fieldWidth / 2 - paddleWidth / 2;
  yPlayerPaddle = fieldHeight - 50;
  xOpponentPaddle = fieldWidth / 2 - paddleWidth / 2;
  yOpponentPaddle = 50;

  socket = io();

  socket.on('paddle movement', function(pos){
    xOpponentPaddle = fieldWidth - pos - paddleWidth;
  });

  socket.on('message', function(message){
    serverMessage = message;
  });

  socket.on('start match', function(id) {
    matchId = id;
    started = true;
  }); 
}

function draw() {
  background(220);
  
  // Game over check
  if(lives === 0) {
    gameover = true;
  }

  // Check win
  if(lives === winCount) {
    won = true;
  }
  
  // Startup
  if (!started || !roundStarted) {
    yBall = fieldHeight / 5;
    xBall = Math.floor(Math.random() * fieldWidth) + ballDiameter;
    
    xPlayerPaddle = fieldWidth / 2;
    yPlayerPaddle = fieldHeight - 50;
    
    roundStarted = true;
  }
  
  // Handle input
  if(keyIsPressed) {
    if (keyCode === LEFT_ARROW) {
      xPlayerPaddle -= paddleSpeed;
      socket.emit('paddle movement', { matchId: matchId, position: xPlayerPaddle });
    } else if (keyCode === RIGHT_ARROW) {
      xPlayerPaddle += paddleSpeed;
      socket.emit('paddle movement', { matchId: matchId, position: xPlayerPaddle });
    }  

    // Press 'a'
    // if (keyCode === 65) {
    //   xOpponentPaddle -= paddleSpeed;
    // } 
    // Press 'd'
    // else if (keyCode === 68) {
    //   xOpponentPaddle += paddleSpeed;
    // }
  }
  
  // Draw ball
  if(started && !gameover && !won) {
    xBall += xBallChange;
    yBall += yBallChange;
  
    
    // Wall bounche
    if (xBall < ballDiameter / 2 || xBall > fieldWidth - 0.5 * ballDiameter) {
      xBallChange *= -1;
    }
    
    // Lost ball
    if(yBall > (fieldHeight + ballDiameter / 2))
    {
      lives--;
      xBallChange = 0;
      yBallChange = 10;
      roundStarted = false;
    }

    // Point!
    if(yBall < 0)
    {
      lives++;
      xBallChange = 0;
      yBallChange = 10;
      roundStarted = false;
    }
    
    // Player paddle collision
    if ((xBall + ballDiameter / 2 > xPlayerPaddle && xBall < xPlayerPaddle + paddleWidth + ballDiameter / 2) && (yBall + (ballDiameter / 2) >= yPlayerPaddle)) {
      var posOnPaddle = xBall - xPlayerPaddle - (paddleWidth / 2);

      xBallChange = posOnPaddle / 10;
      yBallChange *= -1;
    }

    // Opponent paddle collision
    if ((xBall + ballDiameter / 2 > xOpponentPaddle && xBall < xOpponentPaddle + paddleWidth + ballDiameter / 2) && (yBall + (ballDiameter / 2) <= yOpponentPaddle)) {
      var posOnPaddle2 = xBall - xOpponentPaddle - (paddleWidth / 2);

      xBallChange = posOnPaddle2 / 10;
      yBallChange *= -1;
    }
  
    fill(0);
    ellipse(xBall, yBall, ballDiameter, ballDiameter);
  }
  
   
  // Draw paddles
  rect(xPlayerPaddle, yPlayerPaddle, paddleWidth, paddleHeight);
  rect(xOpponentPaddle, yOpponentPaddle, paddleWidth, paddleHeight);
  
  // Draw server message
  textSize(16);
  textAlign(LEFT);
  text(serverMessage, 30, 30);

  // Draw matchid
  textSize(16);
  textAlign(LEFT);
  text(matchId, fieldWidth - 150, 30);

  // Draw lives text
  textSize(16);
  textAlign(LEFT);
  text('Lives: ' + lives, 30, 60);
  
  // Draw press start
  if (!started && !inQueue) {
    textSize(32);
    textAlign(CENTER);
    text('Press space to play (again)', 0, 250, fieldWidth);
  }

  // Draw gameover text
  if(gameover) {
    textSize(32);
    textAlign(CENTER);
    text('Game over', 0, 150, fieldWidth);
  }

  // Draw won text
  if(won) {
    textSize(32);
    textAlign(CENTER);
    text('You won!', 0, 150, fieldWidth);
  } 
}

function keyPressed() {
  // Press space
  if(keyCode === 32 && !inQueue) {
    playerId = Date.now();
    socket.emit('request play');

    inQueue = true;
  }
}