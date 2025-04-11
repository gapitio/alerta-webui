import moment from 'moment'
export default function timeago(value?: string) {
  if (value) {
    return moment(String(value)).fromNow()
  }
}
