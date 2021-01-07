class Player {
    constructor(playerID, name) {
        this.ID = playerID;
        this.name = name;
        this.roomID = null;
        this.points = 0;
    }

    addPoints(points) {
        this.points += 20;
    }
}

module.exports = Player;