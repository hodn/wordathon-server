const csv = require('csv-parser');
const fs = require('fs');

const getNoun = (dictionaryEntry) => {

  let entry = null;
  const entrySplit = dictionaryEntry[0].split(" ")
  let word = entrySplit[0].toLowerCase()
  const type = entrySplit[1]

  if (word && type) {
    if (type.includes("n.")) {
      entrySplit.splice(0, 2)
      let definition = entrySplit.join(" ")
      if (word.includes('"')) word = word.substring(1)
      if (definition.includes('"')) definition = definition.slice(0, -2)
      entry = { word, definition }
    }
  }

  return entry;
}

module.exports.loadDictionary = () => {
  const dictionaryPath = 'C://Users//Hoang//wordathon-server//dictionary';
  const loadedDictionary = [];
  
  fs.readdir(dictionaryPath, (err, files) => {
    files.forEach(file => {
      const stream = fs.createReadStream(dictionaryPath + "//" + file);
      loadedDictionary[file] = [];

      stream
        .pipe(csv({ headers: false, newline: "\n\n" }))
        .on('data', (data) => {
          const word = getNoun(data)
          if (word !== null) loadedDictionary[file].push(word)
        })
    });
  });
  return loadedDictionary;
}

