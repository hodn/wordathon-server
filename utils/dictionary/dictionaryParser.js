// Looks up the word in the dictionary
// Returns definitions if the word is a noun (or other requirement)
const loadDictionary = async () => {

  const Fs = require('fs');
  const AutoDetectDecoderStream = require('autodetect-decoder-stream');
  const CsvReadableStream = require('csv-reader');

  let file = Fs.createReadStream('./utils/dictionary/wordnet_dictionary.csv')
    .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' })); // If failed to guess encoding, default to 1255

  const rows = [];

  let dictionary = new Promise(function (resolve, reject) {
    file
      .pipe(new CsvReadableStream())
      .on('data', function (row) {
        rows.push(row);
      })
      .on('end', function () {
        resolve(rows);
      })
      .on('error', reject);
  });

  return dictionary;
}

const getDefinitions = async (dictionary, word) => {

  let dic = await dictionary;

  const result = new Promise( (resolve) => {

    for(let i = 0; i < dic.length; i++) {
      if (dic[i][0] === word) {
        definitions = [dic[i][1]];
        resolve({word, definitions}) ;
      }
    }
      resolve(null);
  })

  return result;
}

module.exports = {
  loadDictionary,
  getDefinitions
};