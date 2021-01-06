const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const port = 5000;
const GameHandler = require("./utils/game/GameHandler");
const gh = new GameHandler();

app.get('/', (req, res) => {
  const entry = req.query.entry;
  res.send();
})

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// New player (socket, device) has connected to the game
io.on('connection', (socket) => {
  
  // Player joins the game server
  socket.on("registerPlayer", (playerName) => {
    gh.registerPlayer(socket.id, playerName);
  })

  // Player creates and joins a room
  socket.on("createRoom", () => {
    const roomID = gh.createRoom(socket.id);
    gh.addPlayerToRoom(socket.id, roomID);
    socket.join(roomID);
  })

  // Player joins room
  socket.on("joinRoom", (roomID) => {
    gh.addPlayerToRoom(socket.id, roomID);
    socket.join(roomID);
    // Update view (JOIN SCREEN)
  })

  // The game (room) is started by the player who had created it 
  // EMITS Room instances on start/end round, end game
  socket.on("startGame", () => {

    const roomID = gh.players[socket.id].roomID;
    const emitRoundStart = (room) => io.to(roomID).emit("startRound", room);
    const emitRoundEnd = (room) => io.to(roomID).emit("endRound", room);
    const emitEndGame = (room) => io.to(roomID).emit("endGame", room);
    
    gh.startRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame);

  })

  socket.on("evaluateWordEntry", (word) => {

    const playerID = socket.id;
    const roomID = gh.players[playerID].roomID;
    const sendEvaluation = (result) => io.to(socket.id).emit("evaluationReply", result);
    const updateScoreBoard = (room) => io.to(roomID).emit("updateScoreboard", room);
    
    gh.evaluateWordEntry(playerID, roomID, word, sendEvaluation, updateScoreBoard);

  })

  // player has left the game server
  // automatically removed from socket io room
  socket.on('disconnect', () => {
    gh.removePlayer(socket.id);
  });
});






