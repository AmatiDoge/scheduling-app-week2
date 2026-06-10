import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { TEAM, DAYS, SLOTS, MIN_SLOTS } from './schedule'
import './styles.css'

export default function App() {
  const [myName, setMyName] = useState(() => localStorage.getItem('sched-name') || '')
  const [bookings, setBookings] = useState({}) // slotId -> name
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase.from('bookings_week2').select('slot_id, booked_by')
    if (data) {
      const map = {}
      data.forEach(r => { map[r.slot_id] = r.booked_by })
      setBookings(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    const channel = supabase
      .channel('bookings-week2-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings_week2' }, fetchBookings)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchBookings])

  const selectName = (name) => {
    setMyName(name)
    localStorage.setItem('sched-name', name)
  }

  const toggleSlot = async (slotId) => {
    if (saving) return
    const owner = bookings[slotId]

    if (owner && owner !== myName) return // taken by someone else

    setSaving(slotId)
    if (owner === myName) {
      await supabase.from('bookings_week2').delete().eq('slot_id', slotId)
    } else {
      await supabase.from('bookings_week2').upsert({ slot_id: slotId, booked_by: myName })
    }
    await fetchBookings()
    setSaving(null)
  }

  const myCount = Object.values(bookings).filter(v => v === myName).length
  const slotsByDay = (dayKey) => SLOTS.filter(s => s.dayKey === dayKey)

  if (!myName) {
    return (
      <div className="screen name-screen">
        <div className="name-card">
          <p className="name-subtitle">שבוע 14–18 יוני 2026</p>
          <h1 className="name-title">מי את/ה?</h1>
          <div className="name-grid">
            {TEAM.map(name => (
              <button key={name} className="name-btn" onClick={() => selectName(name)}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen main-screen" dir="rtl">
      <header className="app-header">
        <div className="header-top">
          <div className="header-name">
            <span className="header-greeting">שלום,</span>
            <span className="header-user">{myName}</span>
            <button className="switch-btn" onClick={() => selectName('')}>החלף</button>
          </div>
          <div className="header-meta">
            <span className="week-label">14–18 יוני 2026</span>
          </div>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(myCount / MIN_SLOTS, 1) * 100}%` }}
            />
          </div>
          <span className={`progress-label ${myCount >= MIN_SLOTS ? 'done' : ''}`}>
            {myCount >= MIN_SLOTS
              ? `✓ בחרת ${myCount} משבצות`
              : `בחרת ${myCount} מתוך ${MIN_SLOTS} משבצות מינימום`}
          </span>
        </div>

        <div className="team-summary">
          {TEAM.map(name => {
            const count = Object.values(bookings).filter(v => v === name).length
            return (
              <div key={name} className={`team-chip ${name === myName ? 'me' : ''}`}>
                <span className="chip-name">{name}</span>
                <span className="chip-count">{count}</span>
              </div>
            )
          })}
        </div>
      </header>

      {loading ? (
        <div className="loader">טוען…</div>
      ) : (
        <main className="days-grid">
          {DAYS.map(day => (
            <section key={day.key} className="day-card">
              <div className="day-header">
                <span className="day-name">{day.label}</span>
                <span className="day-date">{day.date}</span>
              </div>
              <div className="slots-list">
                {slotsByDay(day.key).map(slot => {
                  const owner = bookings[slot.id]
                  const isMine = owner === myName
                  const isTaken = owner && !isMine
                  const isLoading = saving === slot.id
                  return (
                    <button
                      key={slot.id}
                      className={`slot ${isMine ? 'slot-mine' : ''} ${isTaken ? 'slot-taken' : ''} ${isLoading ? 'slot-saving' : ''}`}
                      onClick={() => toggleSlot(slot.id)}
                      disabled={isTaken || isLoading}
                    >
                      <span className="slot-time" dir="ltr">{slot.time}</span>
                      {isMine && <span className="slot-badge">✓ אני</span>}
                      {isTaken && <span className="slot-badge slot-badge-other">{owner}</span>}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  )
}
