const { nanoid } = require("nanoid");

class Room {
    constructor(playerID) {
        this.ID = nanoid(5);
        this.ownerID = playerID;
        this.players = {};
        this.settings = {
            numberOfRounds: 3,
            numberOfLetters: 12,
            roundDuration: 5,
        };
        this.delayBetweenRounds = 10;
        this.round = 0;
        this.inRound = false;
        this.roundEndTime = null;
        this.roundNextStart = null;
        this.roundLetters = [];
        this.roundWordPool = {}; 
    }

    startRound() {
        this.round += 1;
        this.roundEndTime = Date.now() + this.settings.roundDuration * 1000;
        this.inRound = true;
        this.roundWordPool = {};
        this.generateLetters();
    }

    endRound() {
        this.roundNextStart = Date.now() + this.delayBetweenRounds * 1000;
        this.inRound = false; 
    }

    generateLetters() {
        // Scrabble letter distribution
        const letters = "aaaaaaaaabbccddddeeeeeeeeeeeffggghhiiiiiiiiijkllllmmnnnnnnooooooooppqrrrrrrssssttttttuuuuvvwwxyyz";
        const roundLetters = [];
        
        for (let index = 0; index < this.settings.numberOfLetters; index++) {
            roundLetters.push(letters[Math.floor(Math.random() * letters.length)]);
        }

        this.roundLetters = roundLetters;
    }

}

module.exports = Room;