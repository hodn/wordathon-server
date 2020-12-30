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
    }

    removePlayer(socketID) {
        delete this.players[socketID];
    }

    createRoom(socketID) {
        let room = new Room(socketID);
        room.players.push(socketID);
        this.players[socketID].roomID = room.ID;
        this.rooms[room.ID] = room;
        
        return room.ID;
    }

}

module.exports = GameHandler;