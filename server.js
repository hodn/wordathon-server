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
    const initializedRoom = gh.addPlayerToRoom(playerID, roomID);
    socket.join(roomID);
    io.to(initializedRoom.ID).emit("initRoom", initializedRoom);
  })

  // Player joins room
  socket.on("joinRoom", (roomID) => {
    const joinedRoom = gh.addPlayerToRoom(playerID, roomID);
    socket.join(joinedRoom.ID);
    io.to(joinedRoom.ID).emit("updateRoom", joinedRoom);
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

 // Player leaves the site
  socket.on('disconnect', () => {
    
    // If the player is registered, remove him from the game list
    if (gh.isPlayerRegistered(playerID)) {
      const room = gh.removePlayer(playerID);
      if (room) io.to(room.ID).emit("updateRoom", room); // if there are still players in the room, update it
    }

    
  });
});






