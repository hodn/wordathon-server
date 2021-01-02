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
       
        setTimeout(() => {
            this.endRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame);
          }, room.roundEndTime - Date.now())
    }

    endRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame) {
        const room = this.rooms[roomID];

        if (room.settings.numberOfRounds > room.round) {
            emitRoundEnd(room);
            setTimeout(() => {
                this.startRound(roomID, emitRoundStart, emitRoundEnd, emitEndGame);
              }, 5000)
        } else {
            emitEndGame(room);
            delete this.rooms[room.ID];
        }
    }

}

module.exports = GameHandler;