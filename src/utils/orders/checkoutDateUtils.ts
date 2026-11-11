export const MAX_SESSION_HOURS = 5

export const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export const getZonedParts = (date: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  )

export const getTodayKey = (date = new Date()) => {
  const parts = getZonedParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export const isPastSlot = (date: string, time: string, now: Date) => {
  if (date < getTodayKey(now)) return true
  if (date > getTodayKey(now)) return false
  const parts = getZonedParts(now)
  const nowSeconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)
  return timeToMinutes(time) * 60 <= nowSeconds
}