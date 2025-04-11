import moment from 'moment'

export default function days(value: moment.DurationInputArg1) {
  function pad(s: number) {
    return ('0' + s).slice(-2)
  }
  if (value) {
    const duration = moment.duration(value, 'seconds')
    const seconds = pad(duration.seconds())
    const minutes = pad(duration.minutes())
    const hours = pad(duration.hours())
    const days = Math.floor(duration.as('d'))
    return `${days} days ${hours}:${minutes}:${seconds}`
  }
}
