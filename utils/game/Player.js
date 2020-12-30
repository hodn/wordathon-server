class Player {
    constructor(socketID, name) {
        this.socketID = socketID;
        this.name = name;
        this.roomID = null;
        this.points = 0;
        this.words = {};
    }


}

module.exports = Player;