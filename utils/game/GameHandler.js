const Player = require("./Player");
const Room = require("./Room");
const dictionaryParser = require("../dictionary/dictionaryParser");

class GameHandler {
    constructor(dictionary) {
        this.rooms = {};
        this.players = {};
        this.dictionary = dictionary;
    }

    registerPlayer(playerID, playerName) {
        let player = new Player(playerID, playerName);
        this.players[playerID] = player;
    }

    isPlayerRegistered(playerID) {
        return playerID in this.players;
    }

    //TODO Think of the way to persist the socket
    removePlayer(playerID) {
        const designatedRoom = this.getRoomState(playerID);

        delete designatedRoom.players[playerID]; // Remove Player KEY from the room players
        delete this.players[playerID]; // Remove Player KEY from  players

        return designatedRoom;
    }

    createRoom(playerID) {
        let room = new Room(playerID);
        this.rooms[room.ID] = room;

        this.addPlayerToRoom(playerID, room.ID);

        return room.ID;
    }

    editRoomSettings(playerID, settings) {
        let room = this.getRoomState(playerID);

        if (room.ownerID === playerID) room.settings = settings;

        return room;
    }

    addPlayerToRoom(playerID, roomID) {
        this.rooms[roomID].players[playerID] = this.players[playerID];
        this.players[playerID].roomID = roomID;

        return this.rooms[roomID];
    }

    getRoomState(playerID) {
        const gameStartingPlayer = this.players[playerID];

        return gameStartingPlayer ? this.rooms[gameStartingPlayer.roomID] : null;
    }

    startGame(playerID, updateRoom, isRestart) {
        const room = this.getRoomState(playerID);

        if (!room) return;

        if (isRestart) room.restartGame();
        room.startRound();
        updateRoom(room);

        setTimeout(() => {
            this.endRound(room, updateRoom);
        }, room.roundEndTime - Date.now())

    }

    continueRound(room, updateRoom) {
        if (!room) return;

        room.startRound();
        updateRoom(room);

        setTimeout(() => {
            this.endRound(room, updateRoom);
        }, room.roundEndTime - Date.now())
    }

    endRound(room, updateRoom) {

        room.endRound();
        updateRoom(room);

        // empty room - all players left
        if (Object.keys(room.players).length === 0) {
            delete this.rooms[room.ID]
            return;
        }

        // if rounds left, start again in set seconds
        if (room.settings.numberOfRounds > room.round) {

            setTimeout(() => {
                this.continueRound(room, updateRoom);
            }, room.roundNextStart - Date.now()) // pause between rounds

        }
    }

    async evaluateWordEntry(playerID, word, sendEvaluation, updateRoom) {

        let reply = {
            word,
            definitions: null,
            result: 0,
        }

        try {
            const result = await dictionaryParser.getDefinitions(this.dictionary, word);
            const player = this.players[playerID];
            const room = this.rooms[player.roomID];

            // Word is actually a noun
            if (result !== null) {

                reply.definitions = result.definitions;

                // First word occurence in the round
                if (!(word in room.roundWordPool)) {
                    room.roundWordPool[word] = {};
                    room.roundWordPool[word].players = [player.ID];
                    room.roundWordPool[word].definition = result.definitions;
                    player.addPoints(20); // Extra points for first occurence
                    player.addPoints(20 + 10 * word.length); // For the noun and its length
                    reply.result = 2;
                } else {
                    // Noun already used
                    // the player already entered the word
                    if (room.roundWordPool[word].players.includes(player.ID)) {
                        reply.result = 0;
                    } else {
                        player.addPoints(20 + 10 * word.length); // For the noun and its length
                        room.roundWordPool[word].players.push(player.ID);
                        reply.result = 1;
                    }

                }
            }

            sendEvaluation(reply);
            updateRoom(room);

        } catch (error) {
            sendEvaluation(reply);
        }


    }

}

module.exports = GameHandler;