const Player = require("./Player");
const Room = require("./Room");
const dictionaryParser = require("../dictionary/dictionaryParser");

class GameHandler {
    constructor() {
        this.rooms =  {};
        this.players = {};
    }

    registerPlayer(socketID, playerName) {
        let player = new Player(socketID, playerName);
        this.players[socketID] = player;
        console.log(this.players);
    }

    removePlayer(socketID) {
        delete this.players[socketID];
        console.log(this.players);
    }

}

module.exports = GameHandler;