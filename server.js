const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 5000;
const GameHandler = require("./utils/game/GameHandler");
const dictionaryParser = require("./utils/dictionary/dictionaryParser");
const dictionary = dictionaryParser.loadDictionary();
const gh = new GameHandler(dictionary);

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
    socket.join(initializedRoom.ID);
    io.to(initializedRoom.ID).emit("updateRoom", initializedRoom);
  })

  // Player joins room
  socket.on("joinRoom", (roomID) => {
    const joinedRoom = gh.addPlayerToRoom(playerID, roomID);
    socket.join(joinedRoom.ID);
    io.to(joinedRoom.ID).emit("updateRoom", joinedRoom); // alerts the whole room
  })

  // Gets the latest room state
  socket.on("getRoomState", (playerID) => {
    const room = gh.getRoomState(playerID);
    io.to(playerID).emit("updateRoom", room); // only to player that requested - getter
  })

   // Gets the latest room state
   socket.on("editRoomSettings", (playerID, settings) => {
    const room = gh.editRoomSettings(playerID, settings);
    io.to(playerID).emit("updateRoom", room); // only to player that requested - getter
  })

  // The game (room) is started by the player who had created it 
  // EMITS Room instances on start/end round, end game
  socket.on("startGame", (settings) => {
    const updateRoom = (room) => io.to(room.ID).emit("updateRoom", room);
    gh.editRoomSettings(playerID, settings);
    gh.startGame(playerID, updateRoom, false);
  })
  
  // Restart the game after it finished
  socket.on("restartGame", () => {
    const updateRoom = (room) => io.to(room.ID).emit("updateRoom", room);
    gh.startGame(playerID, updateRoom, true);
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






