const Player = require("./Player");
const Room = require("./Room");
const DictionaryParser = require("../dictionary/DictionaryParser");

class GameHandler {
    constructor() {
        this.rooms = {};
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
            }, 5000) // pause between rounds
        } else {
            emitEndGame(room);
            delete this.rooms[room.ID];
        }
    }

    async evaluateWordEntry(playerID, roomID, word, sendEvaluation, updateScoreBoard) {

        try {
            const definitions = await DictionaryParser.getDefinitions(word);
            const room = this.rooms[roomID];
            const player = this.players[playerID];

            // Word is actually a noun
            if (definitions) {
                player.points += 20; // For the noun

                // Noun first time in the round
                if (!(word in room.roundWordPool)) {
                    room.roundWordPool[word] = [player.ID];
                    player.points += 20; // Extra points for first occurence
                    sendEvaluation(2);
                } else {
                    // Noun already used
                    room.roundWordPool[word].push(player.ID);
                    sendEvaluation(1); // A noun, but not first
                }

                updateScoreBoard(room);

            } else {
                // Word is not a noun
                sendEvaluation(0);

            }

        } catch (error) {
            sendEvaluation(0);
        }


    }

}

module.exports = GameHandler;