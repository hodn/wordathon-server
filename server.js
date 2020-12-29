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
const dictionaryParser = require("./utils/dictionary/dictionaryParser");

app.get('/', (req, res) => {
  console.log(dictionaryParser.loadDictionary());
})

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// New player (socket, device) has connected to the game
io.on('connection', (socket) => {

  // player creates a game (room)

  // player joins a game (room)

  // player sends a word - verify, add points

  // player has left the game
  socket.on('disconnect', () => {
    console.log('player disconnected');
  });
});





