const vccConst = 3.3
const bitalinoValue = 0.132
const bitSize = Math.pow(2, 10)
const sensorGain = 1100

/*
 * reference:
 * http://bitalino.com/datasheets/REVOLUTION_ECG_Sensor_Datasheet.pdf
 */
function transformEKG(adc) {
  return (((adc / bitSize) - 0.5) * vccConst) / sensorGain
}

/*
 * reference:
 * http://bitalino.com/datasheets/REVOLUTION_EDA_Sensor_Datasheet.pdf
 */

function transformGSR(adc) {
  return ((adc / bitSize) * vccConst) / bitalinoValue
}

module.exports = {
  transformGSR,
  transformEKG,
}
