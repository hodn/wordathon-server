class Room {
    constructor(playerID) {
        this.ID = playerID + Date.now();
        this.ownerID = playerID;
        this.players = {};
        this.settings = {
            numberOfRounds: 3,
            roundDuration: 5,
            delayBetweenRounds: 5
        };
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
        this.generateLetters();
    }

    endRound() {
        this.roundNextStart = Date.now() + this.settings.delayBetweenRounds * 1000;
        this.inRound = false; 
    }

    generateLetters() {
        // Scrabble letter distribution
        const letters = "aaaaaaaaabbccddddeeeeeeeeeeeffggghhiiiiiiiiijkllllmmnnnnnnooooooooppqrrrrrrssssttttttuuuuvvwwxyyz";
        const roundLetters = [];
        
        for (let index = 0; index < 12; index++) {
            roundLetters.push(letters[Math.floor(Math.random() * letters.length)]);
        }

        this.roundLetters = roundLetters;
    }

}

module.exports = Room;