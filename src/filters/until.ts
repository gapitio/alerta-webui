import moment from 'moment'

export default function until(value: string | undefined) {
  if (value) {
    return moment(String(value)).fromNow()
  }
}
