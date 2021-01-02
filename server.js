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
  })

  // The game (room) is started by the player who had created it 
  // EMITS Room instances on start/end round, end game
  socket.on("startGame", () => {

    const roomID = gh.players[socket.id].roomID;
    const emitRoundStart = (payload) => io.to(roomID).emit("startRound", payload);
    const emitRoundEnd = (payload) => io.to(roomID).emit("endRound", payload);
    const emitEndGame = (payload) => io.to(roomID).emit("endGame", payload);
    
    gh.startRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame);

  })

  // player has left the game server
  // automatically removed from socket io room
  socket.on('disconnect', () => {
    gh.removePlayer(socket.id);
  });
});






