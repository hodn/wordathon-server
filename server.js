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

const dictionary = dictionaryParser.loadDictionary();

app.get('/', (req, res) => {
  const entry = req.query.entry;
  let definitions = dictionaryParser.validateEntry(dictionary, entry)
  let string = "";

  definitions.forEach(def => {
      string += def;
      string += "<br>";
  });

  res.send(string);
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






