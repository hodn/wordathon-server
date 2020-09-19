const express = require('express')
const csv = require('csv-parser')
const fs = require('fs')
const app = express()
const port = 3000

const results = [];
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

app.get('/', (req, res) => {

  const entry = req.query.entry
  let definition = null
  
  for (let index = 0; index < results.length; index++) {
    if (entry === results[index].word){
      definition = results[index].definition
      break
    }
  }
  res.send(definition)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const stream = fs.createReadStream('./dictionary/M.csv')

stream
  .pipe(csv({ headers: false, newline: "\n\n" }))
  .on('data', (data) => {
    const word = getNoun(data)
    if (word !== null) results.push(word)
  })


