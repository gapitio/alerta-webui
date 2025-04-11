export default function capitalize(value: string) {
  if (value == null) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
}
