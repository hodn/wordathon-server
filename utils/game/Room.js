class Room {
    constructor(playerID) {
        this.ID = playerID + Date.now();
        this.players = [];
        this.round = 0;
        this.settings = {};
    }

}

module.exports = Room;