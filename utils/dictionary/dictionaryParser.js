// Looks up the word in the dictionary
// Returns definitions if the word is a noun (or other requirement)
module.exports.getDefinitions = (word) => {

  const CsvReadableStream = require('csv-reader');
  const Fs = require('fs');
  const AutoDetectDecoderStream = require('autodetect-decoder-stream');

  let dictionary = Fs.createReadStream('./utils/dictionary/wordnet_dictionary.csv')
	  .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' })); // If failed to guess encoding, default to 1255

  const definitions = []
  let hit = false;

  let result = new Promise(function(resolve, reject) {
    dictionary
    .pipe(new CsvReadableStream())
    .on('data', function (row) {
      if(row[0] === word) {
        definitions.push(row[1]);
        hit = true;
      }
    })
    .on('end', function () {
        resolve(hit === true ? {word, definitions} : null);
    })
    .on('error', reject);
});

  return result;
  
}
