const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const getNounWithDefinition = (entry) => {

  let record = null;
  const entrySplit = entry[0].split(" ");
  let word = entrySplit[0]; // Word in dictionary
  const type = entrySplit[1]; // noun, adjective, etc.

  if (word && type) {
    
    // if noun
    if (type.includes("n.")) {
      
      entrySplit.splice(0, 2)
      let definition = entrySplit.join(" ")
      if (word.includes('"')) word = word.substring(1) // Given by the format of the data
      if (definition.includes('"')) definition = definition.slice(0, -2)
      
      record = { word, definition }
    }
  }

  return record;
}

module.exports.loadDictionary = () => {
  const dictionaryPath = path.join(__dirname, "..", "..", "dictionary");
  const loadedDictionary = {};
  
  fs.readdir(dictionaryPath, (err, files) => {
    files.forEach(file => {
      const stream = fs.createReadStream(path.join(dictionaryPath, file));
      const characterSet = path.parse(file).name;
      loadedDictionary[characterSet] = [];

      stream
        .pipe(csv({ headers: false, newline: "\n\n" }))
        .on('data', (data) => {
          const noun = getNounWithDefinition(data)
          if (noun) loadedDictionary[characterSet].push(noun)
        })
    });
  });

  return loadedDictionary;
}

module.exports.validateEntry = (dictionary, entry) => {
  const characterSet = entry[0].toUpperCase();
  const availableNouns = dictionary[characterSet];
  let definitions = [];

  for (let index = 0; index < availableNouns.length; index++) {
    if (entry === availableNouns[index].word){
      definitions.push(availableNouns[index].definition);
    }
  }

  return definitions;
}

