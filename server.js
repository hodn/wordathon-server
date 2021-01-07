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
  
  const playerID = socket.id;

  // Player joins the game server
  socket.on("registerPlayer", (playerName) => {
    gh.registerPlayer(playerID, playerName);
  })

  // Player creates and joins a room
  socket.on("createRoom", () => {
    const roomID = gh.createRoom(playerID);
    const room = gh.addPlayerToRoom(playerID, roomID);
    socket.join(roomID);
    io.to(room.ID).emit("initRoom", room);
  })

  // Player joins room
  socket.on("joinRoom", (roomID) => {
    const room = gh.addPlayerToRoom(playerID, roomID);
    socket.join(roomID);
    io.to(room.ID).emit("updateRoom", room);
  })

  // The game (room) is started by the player who had created it 
  // EMITS Room instances on start/end round, end game
  socket.on("startGame", () => {
    const emitRoundStart = (room) => io.to(room.ID).emit("startRound", room);
    const emitRoundEnd = (room) => io.to(room.ID).emit("endRound", room);
    const emitEndGame = (room) => io.to(room.ID).emit("endGame", room);

    gh.startRound(playerID, emitRoundStart, emitRoundEnd, emitEndGame);

  })

  socket.on("evaluateWordEntry", (word) => {
    const sendEvaluation = (result) => io.to(playerID).emit("evaluationReply", result);
    const updateRoom = (room) => io.to(room.ID).emit("updateRoom", room);
    
    gh.evaluateWordEntry(playerID, word, sendEvaluation, updateRoom);

  })

  // player has left the game server
  // automatically removed from socket io room
  socket.on('disconnect', () => {
    const room = gh.removePlayer(playerID);
    io.to(room.ID).emit("updateRoom", room);
  });
});






