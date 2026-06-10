export const TEAM = ['נועה', 'קרן', 'יובל', 'שירה']

export const DAYS = [
  { key: 'sun', label: 'ראשון', date: '14.6' },
  { key: 'mon', label: 'שני', date: '15.6' },
  { key: 'tue', label: 'שלישי', date: '16.6' },
  { key: 'wed', label: 'רביעי', date: '17.6' },
  { key: 'thu', label: 'חמישי', date: '18.6' },
]

const WEEKDAY_SLOTS = [
  '08:00–09:30',
  '09:30–11:00',
  '11:00–12:30',
  '12:30–14:00',
  '14:00–15:30',
  '15:30–17:00',
  '17:00–18:30',
]

export const SLOTS = DAYS.flatMap(day =>
  WEEKDAY_SLOTS.map(time => ({
    id: `${day.key}-${time}`,
    dayKey: day.key,
    time,
  }))
)

export const MIN_SLOTS = 3
