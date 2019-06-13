const fs = require('fs')
const readline = require('readline')
const { promisify } = require('util')
const path = require('path')

async function main(userId) {
  const file = `output/${userId}.csv`
  const fileStream = fs.createReadStream(file)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let last1000 = []
  let output = 'ekg,gsr,answer_valence,answer_arousal\n'
  let i = 0
  let answerId = 0
  let j = false

  for await (const line of rl) {
    if (j === false) {
      j = true
      continue
    }

    if (last1000.length > 1000 - 1) {
      last1000.shift()
    }

    const [
      ekg,
      gsr,
      answer_valence,
      answer_arousal,
    ] = line.split(',')

    if (i > 0 && i < 6000) {
      output += [ekg, gsr, answer_valence, answer_arousal].join(',') + '\n'
      i += 1
      continue
    }

    if (i >= 6000) {
      i = 0
      fs.writeFileSync(`output/cut/${userId}-answer-${answerId}.csv`, output)
      answerId += 1
      output = 'ekg,gsr,answer_valence,answer_arousal\n'
    }

    if (answer_valence !== '' || answer_arousal !== '') {
      for (const el of last1000) {
        output += [el.ekg, el.gsr, el.answer_valence, el.answer_arousal].join(',') + '\n'
      }

      output += [ekg, gsr, answer_valence, answer_arousal].join(',') + '\n'

      last1000 = []
      i = 1
    } else {
      last1000.push({ ekg, gsr, answer_valence, answer_arousal, })
    }
  }
}

main(process.argv[2])
