const fs = require('fs')
const readline = require('readline')
const { promisify } = require('util')
const path = require('path')
const { transformGSR } = require('./modules/transform.js')

async function main(userId) {
  const round = n => Math.floor(n * (10 ** 8)) / (10 ** 8)

  const files = (await promisify(fs.readdir)(path.resolve('./output/cut')))
    .filter(filename => new RegExp(`^${userId}-.+$`).test(filename))
    .sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare)

  let i = 0

  for (const file of files) {
    const fileStream = fs.createReadStream(`./output/cut/${file}`)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })

    const output = {
      answerValence: null,
      answerArousal: null,
      gsr: [],
    }
    let j = 0

    for await (const line of rl) {
      // Skip the header
      if (j == 0) {
        j += 1
        continue
      }

      const [, gsr, answerValence, answerArousal] = line.split(',')

      if (answerValence !== '' || answerArousal !== '') {
        output['answerValence'] = answerValence
        output['answerArousal'] = answerArousal
      }

      output.gsr.push(round(transformGSR(gsr)))

      j += 1
    }

    fs.writeFileSync(`output/cut-transformed/${file.replace('csv', 'json')}`, JSON.stringify(output))

    i += 1
  }
}

main(process.argv[2])
