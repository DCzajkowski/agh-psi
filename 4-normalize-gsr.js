const fs = require('fs')
const readline = require('readline')
const { promisify } = require('util')
const path = require('path')

async function main(userId) {
  const files = (await promisify(fs.readdir)(path.resolve('./output/cut-transformed')))
    .filter(filename => new RegExp(`^${userId}-.+$`).test(filename))
    .sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare)

  let i = 0

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(`./output/cut-transformed/${file}`))

    const initialMean = data.gsr.slice(0, 1001).reduce((a, b) => a + b, 0) / 1000

    const output = {
      ...data,
      gsr: data.gsr.map(g => g - initialMean),
    }

    fs.writeFileSync(`./output/cut-normalized/${file}`, JSON.stringify(output))
  }
}

main(process.argv[2])
