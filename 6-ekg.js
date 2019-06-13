const fs = require('fs')
const readline = require('readline')

const DESTINATION = 'output/ekg-parts/'

const { promisify } = require('util')
const path = require('path')
const timeWindow = 14000;
let file_write;
let lineNumber = -1;
let isEvent = false
let eventLineNumber = 0
let eventNumber = -1
let eventLines = []

async function main(userId) {
  const file = `output/${userId}.csv`
  const fileStream = fs.createReadStream(file)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    lineNumber +=1
    const [
      ekg,
      gsr,
      answer_valence,
      answer_arousal,
    ] = line.split(',')

    if (lineNumber == 0) {
      continue
    }

    if (eventFound(answer_valence, answer_arousal)){
      isEvent = true
      eventLineNumber = -1
      eventNumber += 1

      // console.log(line)

      const filename = `${DESTINATION}${userId}_${eventNumber}.csv`
      file_write = fs.createWriteStream(filename)
      file_write.write('ekg,answer_valence,answer_arousal\n')
    }

    if (isEvent){
      eventLineNumber += 1
      file_write.write([ekg,answer_valence,answer_arousal].join(',') + '\n')
    }

    if (eventLineNumber > timeWindow) {
      isEvent = false
      file_write.close()
    }
  }
}

const eventFound  = function(valence, arousal) {
  return !!valence || !!arousal
}

const saveEvent = async function(eventLines, eventNumber, userId) {
  const filename = `${DESTINATION}${userId}_${eventNumber}.csv`
  const csvArray = ['ekg,answer_valence,answer_arousal'].concat(eventLines)
  const data = csvArray.join('\n')
  const write = promisify(fs.writeFile)

  await write(filename,data)
}

main(process.argv[2])
