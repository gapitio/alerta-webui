import moment from 'moment'

export default function hhmmss(value: moment.DurationInputArg1) {
  function pad(s: number) {
    return ('0' + s).slice(-2)
  }
  if (value) {
    const duration = moment.duration(value, 'seconds')
    const seconds = pad(duration.seconds())
    const minutes = pad(duration.minutes())
    const hours = Math.floor(duration.as('h'))
    return `${hours}:${minutes}:${seconds}`
  }
}
