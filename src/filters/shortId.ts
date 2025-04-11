export default function shortId(value: string) {
  if (value) {
    return String(value).substring(0, 8)
  }
}
