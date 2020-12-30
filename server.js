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
  
  socket.on("registerPlayer", (playerName) => {
    gh.registerPlayer(socket.id, playerName);
  })

  socket.on("createRoom", () => {
    const roomID = gh.createRoom(socket.id);
    socket.join(roomID);
  })
  // player creates a game (room)

  // player joins a game (room)

  // player sends a word - verify, add points

  // player has left the game
  socket.on('disconnect', () => {
    gh.removePlayer(socket.id);
  });
});






