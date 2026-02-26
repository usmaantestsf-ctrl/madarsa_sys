// app/(dashboard)/admin/calendar/hijri-calendar.tsx
'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Hijri helpers using built-in Intl API (no deps) ──────────────────────────

function toHijri(date: Date): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  const parts = fmt.formatToParts(date)
  return {
    year:  parseInt(parts.find(p => p.type === 'year')!.value),
    month: parseInt(parts.find(p => p.type === 'month')!.value),
    day:   parseInt(parts.find(p => p.type === 'day')!.value),
  }
}

function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  const approxMs = (hYear - 1) * 354.367 * 86400000 +
                   (hMonth - 1) * 29.53 * 86400000 +
                   (hDay - 1) * 86400000 +
                   new Date('0622-07-16').getTime()

  let date = new Date(approxMs)

  for (let i = 0; i < 5; i++) {
    const h = toHijri(date)
    const diff = (hYear - h.year) * 354 + (hMonth - h.month) * 29 + (hDay - h.day)
    if (diff === 0) break
    date = new Date(date.getTime() + diff * 86400000)
  }
  return date
}

function getDaysInHijriMonth(hYear: number, hMonth: number): number {
  const first = hijriToGregorian(hYear, hMonth, 1)
  const nextMonth = hMonth === 12
    ? hijriToGregorian(hYear + 1, 1, 1)
    : hijriToGregorian(hYear, hMonth + 1, 1)
  return Math.round((nextMonth.getTime() - first.getTime()) / 86400000)
}

function getFirstDayOfHijriMonth(hYear: number, hMonth: number): number {
  const date = hijriToGregorian(hYear, hMonth, 1)
  return date.getDay()
}

// ── Constants ────────────────────────────────────────────────────────────────

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
]

const ARABIC_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ISLAMIC_EVENTS: Record<string, string> = {
  '1-1':  'Islamic New Year',
  '1-10': 'Ashura',
  '3-12': 'Mawlid al-Nabi',
  '7-27': "Isra and Mi'raj",
  '9-1':  'Ramadan Begins',
  '9-27': 'Laylat al-Qadr',
  '10-1': 'Eid al-Fitr',
  '12-9': 'Day of Arafah',
  '12-10':'Eid al-Adha',
  '12-18':'Eid al-Adha (End)',
}

// ── Component ────────────────────────────────────────────────────────────────

export function HijriCalendar() {
  const today = new Date()
  const todayHijri = toHijri(today)

  const [currentYear,  setCurrentYear]  = useState(todayHijri.year)
  const [currentMonth, setCurrentMonth] = useState(todayHijri.month)
  const [selectedDay,  setSelectedDay]  = useState<number | null>(todayHijri.day)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const daysInMonth  = useMemo(() => getDaysInHijriMonth(currentYear, currentMonth),  [currentYear, currentMonth])
  const firstWeekDay = useMemo(() => getFirstDayOfHijriMonth(currentYear, currentMonth), [currentYear, currentMonth])

  // ✅ FIX: Compute Gregorian date of day 1 once, then offset for all other days
  const firstDayGregorian = useMemo(
    () => hijriToGregorian(currentYear, currentMonth, 1),
    [currentYear, currentMonth]
  )

  const getGregorianForDay = (day: number) => {
    const d = new Date(firstDayGregorian)
    d.setDate(d.getDate() + (day - 1))
    return d
  }

  const goToPrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentYear(todayHijri.year)
    setCurrentMonth(todayHijri.month)
    setSelectedDay(todayHijri.day)
    setShowYearPicker(false)
  }

  const isToday = (day: number) =>
    day === todayHijri.day &&
    currentMonth === todayHijri.month &&
    currentYear === todayHijri.year

  const getEventForDay = (day: number) => ISLAMIC_EVENTS[`${currentMonth}-${day}`]

  const selectedInfo = selectedDay
    ? { gregorian: getGregorianForDay(selectedDay), event: getEventForDay(selectedDay) }
    : null

  const yearRange = Array.from({ length: 20 }, (_, i) => todayHijri.year - 5 + i)

  return (
    <div className="space-y-6">

      {/* Today's date banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-700 font-medium">
              Today: {todayHijri.day} {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year} AH
            </p>
            <p className="text-xs text-blue-600" dir="rtl">
              {todayHijri.day} {ARABIC_MONTHS[todayHijri.month - 1]} {todayHijri.year} هـ
            </p>
          </div>
        </div>
        <p className="text-sm text-blue-600">
          {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendar Grid ── */}
        <div className="lg:col-span-2">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <div className="text-center">
              <button
                onClick={() => setShowYearPicker(v => !v)}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {HIJRI_MONTHS[currentMonth - 1]} {currentYear} AH
              </button>
              <p className="text-sm text-gray-500" dir="rtl">
                {ARABIC_MONTHS[currentMonth - 1]} {currentYear} هـ
              </p>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Year picker */}
          {showYearPicker && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-5 gap-2">
                {yearRange.map(year => (
                  <button
                    key={year}
                    onClick={() => { setCurrentYear(year); setShowYearPicker(false) }}
                    className={`px-2 py-1.5 text-sm rounded-md transition-colors ${
                      year === currentYear
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map(day => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-2 ${
                  day === 'Fri' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const event   = getEventForDay(day)
              const greg    = getGregorianForDay(day)  // ✅ now uses offset-based helper
              const isJumua = greg.getDay() === 5

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`
                    relative flex flex-col items-center justify-center
                    rounded-lg p-1 min-h-[52px] text-sm transition-all
                    ${isToday(day)
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                      : selectedDay === day
                        ? 'bg-blue-100 text-blue-800 font-semibold ring-1 ring-blue-400'
                        : isJumua
                          ? 'text-blue-600 hover:bg-blue-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-base leading-tight">{day}</span>
                  <span className={`text-xs leading-tight ${isToday(day) ? 'text-blue-100' : 'text-gray-400'}`}>
                    {greg.getDate()}
                  </span>
                  {event && (
                    <span className={`
                      absolute bottom-0.5 left-1/2 -translate-x-1/2
                      w-1.5 h-1.5 rounded-full
                      ${isToday(day) ? 'bg-yellow-300' : 'bg-green-500'}
                    `} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Go to today */}
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Go to Today
            </Button>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-4">

          {/* Selected day details */}
          {selectedInfo ? (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">
                {selectedDay} {HIJRI_MONTHS[currentMonth - 1]} {currentYear} AH
              </h4>
              <p className="text-sm text-blue-700 mb-1" dir="rtl">
                {selectedDay} {ARABIC_MONTHS[currentMonth - 1]} {currentYear} هـ
              </p>
              <p className="text-sm text-blue-700 mb-3">
                {selectedInfo.gregorian.toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              {selectedInfo.event && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 text-sm px-3 py-2 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  {selectedInfo.event}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
              Click a day to see details
            </div>
          )}

          {/* Islamic events this month */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              Events in {HIJRI_MONTHS[currentMonth - 1]}
            </h4>
            {(() => {
              const monthEvents = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                .map(day => ({ day, event: getEventForDay(day) }))
                .filter(e => e.event)

              return monthEvents.length > 0 ? (
                <ul className="space-y-2">
                  {monthEvents.map(({ day, event }) => (
                    <li
                      key={day}
                      className="flex items-start gap-2 text-sm cursor-pointer"
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-800 rounded-full text-xs font-medium flex-shrink-0">
                        {day}
                      </span>
                      <span className="text-gray-700 pt-0.5">{event}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No special events this month</p>
              )
            })()}
          </div>

          {/* Legend */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legend</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 flex-shrink-0" />
                Today
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-400 flex-shrink-0" />
                Selected day
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-medium">J</span>
                </span>
                Jumu'ah (Friday)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </span>
                Islamic event
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
