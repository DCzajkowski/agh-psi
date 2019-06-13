const fs = require('fs')
const readline = require('readline')
const { promisify } = require('util')
const path = require('path')

async function processAnswers(file) {
  const processAnswerLine = line => {
    const parts = line.trim().split('\t')

    return {
      type: parts[3], // p0s0
      answer: JSON.parse(parts[7]),
      reactionTime: parts[8],
      timestamp: Math.floor(parseFloat(parts[9]) * 1000),
    }
  }
  const answers = []
  const fileStream = fs.createReadStream(`./2019-afcai-spring/procedura/${file}`)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let i = -1

  for await (const line of rl) {
    i += 1

    answers.push({
      i,
      ...processAnswerLine(line),
    })
  }

  return answers
}

async function processSensors(file, userId, answers) {
  const getStartTimestampInMilliseconds = line => {
    const header = JSON.parse(line.substr(1))
    const { time, date } = header[Object.keys(header)[0]]

    return new Date(`${date} ${time}`) - new Date('1970-01-01')
  }
  const processSensorsLine = line => {
    const parts = line.trim().split('\t')

    return {
      sequenceNumber: parts[0],
      ekg: parts[parts.length - 2],
      gsr: parts[parts.length - 1],
    }
  }
  const emotionScale = value => ({
    '-': -1,
    '+': 1,
    '0': 0,
  }[value])
  const fileStream = fs.createReadStream(`./2019-afcai-spring/bitalino/${file}`)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let points = []
  let i = -1
  let startTimestampInMilliseconds

  console.log(
    [
      'ekg',
      'gsr',
      'answer_valence',
      'answer_arousal',
    ].join(',')
  )

  for await (const line of rl) {
    i += 1

    if (i == 1) {
      startTimestampInMilliseconds = getStartTimestampInMilliseconds(line)
    }

    if (i <= 2) {
      continue
    }

    const l = {
      ...processSensorsLine(line),
      i: i - 3,
      timestamp: startTimestampInMilliseconds + i - 3,
    }

    const answer = answers.find(a => a.timestamp == l.timestamp)

    if (answer) {
      const [picture, sound] = answer.type.replace('p', '').split('s')

      console.log(
        [
          l.ekg,
          l.gsr,
          Array.isArray(answer.answer) ? ((answer.answer[0] + 1) * 2 + 1) : answer.answer,
          Array.isArray(answer.answer) ? ((answer.answer[1] + 1) * 2 + 1) : null,
        ].join(',')
      )
    } else {
      console.log(
        [
          l.ekg,
          l.gsr,
          '',
          '',
        ].join(',')
      )
    }

    if (points.length >= 1000) {
      writePoints(points)
      points = []
      process.stdout.write('.')
    }
  }

  if (points.length > 0) {
    writePoints(points)
  }
}

async function main(userId) {
  try {
    const sensorsFiles = await promisify(fs.readdir)(path.resolve('./2019-afcai-spring/bitalino'))
    const answersFiles = await promisify(fs.readdir)(path.resolve('./2019-afcai-spring/procedura'))

    const answerFile = answersFiles.filter(f => new RegExp(`${userId}.+`).test(f))[0]
    const sensorFile = sensorsFiles.filter(f => new RegExp(`${userId}.+`).test(f))[0]

    const answers = await processAnswers(answerFile)

    processSensors(sensorFile, userId, answers)
  } catch (e) {
    console.log(e)
  }
}

main(process.argv[2])
