const axios = require("axios").default;
require('dotenv').config();

// Looks up the word in the dictionary
// Returns definitions if the word is a noun (or other requirement)
module.exports.getDefinitions = async (word) => {

  try {
    let options = {
      method: 'GET',
      url: 'https://wordsapiv1.p.rapidapi.com/words/' + word,
      headers: {
        'x-rapidapi-key': process.env.WORD_API_KEY,
        'x-rapidapi-host': process.env.WORD_API_HOST,
      }
    };

    const response = await axios.request(options);
    const definitions = [];

    // Find the definition for nouns
    response.data["results"].forEach(result => {
      if (result["partOfSpeech"] === "noun") {
        definitions.push(result.definition);
      }
    });
    
    return definitions;

  } catch (err) {
    console.error(err);
    return null;
  }
}




