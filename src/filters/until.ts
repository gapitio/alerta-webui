import moment from 'moment'

export default function until(value?: string) {
  if (value) {
    return moment(String(value)).fromNow()
  }
}
