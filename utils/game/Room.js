class Room {
    constructor(playerID, name) {
        this.ID = playerID + Date.now();
        this.name = name;
        this.players = [];
        this.round = 0;
        this.settings = {};
    }

}

module.exports = Room;