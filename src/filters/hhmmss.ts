import moment from 'moment'
function pad(s: number) {
  return ('0' + s).slice(-2)
}

export function hhmmLocalToUtc(value: string) {
  const date = new Date()
  date.setHours(Number(value.substring(0, 2)), Number(value.substring(3)))
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  return `${hours}:${minutes}`
}

export function hhmmUtcToLocal(value: string) {
  const date = new Date()
  date.setUTCHours(Number(value.substring(0, 2)), Number(value.substring(3)))
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${hours}:${minutes}`
}

export function hhmmss(value: moment.DurationInputArg1) {
  if (value) {
    const duration = moment.duration(value, 'seconds')
    const seconds = pad(duration.seconds())
    const minutes = pad(duration.minutes())
    const hours = Math.floor(duration.as('h'))
    return `${hours}:${minutes}:${seconds}`
  }
}
