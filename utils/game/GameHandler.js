const Player = require("./Player");
const Room = require("./Room");
const DictionaryParser = require("../dictionary/DictionaryParser");

class GameHandler {
    constructor() {
        this.rooms = {};
        this.players = {};
    }

    registerPlayer(playerID, playerName) {
        let player = new Player(playerID, playerName);
        this.players[playerID] = player;
    }

    isPlayerRegistered(playerID) {
        return playerID in this.players;
    }

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
        const roomID = this.players[playerID].roomID;
        return this.rooms[roomID];
    }

    startRound(playerID, updateRoom) {
        const room = this.getRoomState(playerID);

        if (room.ownerID === playerID) {

            room.startRound();
            updateRoom(room);

            setTimeout(() => {
                this.endRound(room, updateRoom);
            }, room.roundEndTime - Date.now())
        }
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
                this.startRound(room.ownerID, updateRoom);
            }, room.roundNextStart - Date.now()) // pause between rounds

        } 
    }

    async evaluateWordEntry(playerID, word, sendEvaluation, updateRoom) {

        const reply = {
            word,
            definitions: null,
            result: 0,
        }

        try {
            const definitions = await DictionaryParser.getDefinitions(word);
            const player = this.players[playerID];
            const room = this.rooms[player.roomID];

            // Word is actually a noun
            if (definitions) {
                player.addPoints(20); // For the noun
                reply.definitions = definitions;

                // Noun first time in the round
                if (!(word in room.roundWordPool)) {
                    room.roundWordPool[word] = {};
                    room.roundWordPool[word].players = [player.ID];
                    room.roundWordPool[word].definition = definitions;
                    player.addPoints(20); // Extra points for first occurence
                    reply.result = 2;


                } else {
                    // Noun already used
                    room.roundWordPool[word].players.push(player.ID);
                    reply.result = 1; // A noun, but not first
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