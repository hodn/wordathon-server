class Room {
    constructor(socketID, name) {
        this.ID = socketID + Date.now();
        this.name = name;
        this.players = [];
        this.round = 0;
        this.settings = {};
    }

}

module.exports = Room;