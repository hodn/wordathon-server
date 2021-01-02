class Room {
    constructor(playerID) {
        this.ID = playerID + Date.now();
        this.players = {};
        this.settings = {
            numberOfRounds: 3,
            roundSecondsDuration: 5
        };
        this.round = 0;
        this.roundEndTime = null;
        this.roundLetters = [];
    }

    startRound() {
        this.round += 1;
        this.roundEndTime = Date.now() + this.settings.roundSecondsDuration * 1000;
        this.generateLetters();

    }

    generateLetters() {
        const consonants = "bcdfghjklmnpqrstvwxyz";
        const vowels = "aeiou";
        const letters = [];
        
        // TODO: Improve the distribution
        for (let index = 0; index < 11; index++) {
            if (index < 7) {
                letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
            } else {
                letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
            }
        }

        this.roundLetters = letters;
    }



}

module.exports = Room;