const Player = require("./Player");
const Room = require("./Room");
const dictionaryParser = require("../dictionary/dictionaryParser");

class GameHandler {
    constructor(io) {
        this.rooms =  {};
        this.players = {};
        this.socket = io;
    }

    registerPlayer(socketID, playerName) {
        let player = new Player(socketID, playerName);
        this.players[socketID] = player;
    }

    removePlayer(socketID) {
        const inRoom = this.players[socketID].roomID;
        delete this.rooms[inRoom].players[socketID]; // Remove from the room

        delete this.players[socketID]; // Remove from players
    }

    createRoom(socketID) {
        let room = new Room(socketID);
        this.rooms[room.ID] = room;

        this.addPlayerToRoom(socketID, room.ID);
        
        return room.ID;
    }

    addPlayerToRoom(socketID, roomID) {
        this.rooms[roomID].players[socketID] = this.players[socketID];
        this.players[socketID].roomID = roomID;
    }

    startRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame) {
        const room = this.rooms[roomID];
        
        room.startRound();
        emitRoundStart(room);
        setTimeout(this.endRound, room.roundEndTime - Date.now(), roomID, emitRoundStart, emitRoundEnd, emitEndGame);
    }

    endRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame) {
        const room = this.rooms[roomID];

        if (room.rounds <= room.round) {
            emitRoundEnd(room);
            setTimeout(this.startRound, 6000, roomID, emitRoundStart, emitRoundEnd, emitEndGame);
        } else {
            emitEndGame(room);
            delete this.rooms[room.ID];
        }
    }

}

module.exports = GameHandler;