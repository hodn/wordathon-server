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
        const roomID = this.players[playerID].roomID;
        const designatedRoom = this.rooms[roomID];
        
        delete designatedRoom.players[playerID]; // Remove Player KEY from the room players
        delete this.players[playerID]; // Remove Player KEY from  players
        
        // If there are players - return new room state, otherwise delete room
        if (Object.keys(designatedRoom.players).length > 0) {
            return designatedRoom;
        } else {
            delete this.rooms[roomID]; 
            return null;
        }
    }

    createRoom(playerID) {
        let room = new Room(playerID);
        this.rooms[room.ID] = room;

        this.addPlayerToRoom(playerID, room.ID);

        return room.ID;
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
        const roomID = this.players[playerID].roomID;
        const room = this.rooms[roomID];

        room.startRound();
        updateRoom(room);
        
        setTimeout(() => {
            this.endRound(playerID, updateRoom);
        }, room.roundEndTime - Date.now())
    }

    endRound(playerID, updateRoom) {
        const roomID = this.players[playerID].roomID;
        const room = this.rooms[roomID];
        
        room.endRound();
        updateRoom(room);

        if (room.settings.numberOfRounds > room.round) {
            room.endRound();
            
            setTimeout(() => {
                this.startRound(playerID, updateRoom);
            }, room.roundNextStart - Date.now()) // pause between rounds

        } else {
            updateRoom(room);
        }
    }

    async evaluateWordEntry(playerID, word, sendEvaluation, updateRoom) {

        try {
            const definitions = await DictionaryParser.getDefinitions(word);
            const player = this.players[playerID];
            const room = this.rooms[player.roomID];

            // Word is actually a noun
            if (definitions) {
                player.addPoints(20); // For the noun

                // Noun first time in the round
                if (!(word in room.roundWordPool)) {
                    room.roundWordPool[word] = [player.ID];
                    player.addPoints(20); // Extra points for first occurence
                    sendEvaluation(2);
                } else {
                    // Noun already used
                    room.roundWordPool[word].push(player.ID);
                    sendEvaluation(1); // A noun, but not first
                }

                updateRoom(room);

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