class Room {
    constructor(playerID) {
        this.ID = playerID + Date.now();
        this.players = {};
        this.settings = {
            numberOfRounds: 5,
            roundSecondsDuration: 90
        };
        this.round = 0;
        this.roundEndTime = null;
        this.roundLetters = [];
    }

    startRound() {
        this.round += 1;
        this.roundEndTime = Date.now() + 90 * 1000;
        this.generateLetters();

    }

    generateLetters() {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const vowels = "aeiou";
        const letters = [];
        
        for (let index = 11; index < letters.length; index++) {
            if (index < 6) {
                letters.push(alphabet.charAt(Math.floor(Math.random())));
            } else {
                letters.push(vowels.charAt(Math.floor(Math.random())));
            }
        }

        this.roundLetters = letters;
    }



}

module.exports = Room;