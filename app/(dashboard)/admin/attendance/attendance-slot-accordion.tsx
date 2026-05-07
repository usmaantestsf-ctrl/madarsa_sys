'use client'

import { useState } from 'react'
import { AttendanceMarker } from './attendance-marker'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'

type Student = {
  id: string
  full_name: string
  admission_number: string
}

type TimetableEntry = {
  id: string
  subjects: { id: string; name: string }
  lecturer: { lecturer_id: number; full_name: string } | null
  time_slots: { id: string; slot_number: number; start_time: string; end_time: string }
}

function formatTime(time?: string) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function AttendanceSlotAccordion({
  timetableEntries,
  students,
  date,
}: {
  timetableEntries: TimetableEntry[]
  students: Student[]
  date: string
}) {
  // Track which slot is open — only one at a time
  const [openSlotId, setOpenSlotId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenSlotId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-2">
      {timetableEntries.map((entry) => {
        const isOpen = openSlotId === entry.id

        return (
          <div
            key={entry.id}
            className="border rounded-lg overflow-hidden bg-white"
          >
            {/* Slot header — always visible, clickable */}
            <button
              onClick={() => toggle(entry.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                  Slot {entry.time_slots?.slot_number}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(entry.time_slots?.start_time)} –{' '}
                  {formatTime(entry.time_slots?.end_time)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {entry.subjects?.name}
                </span>
                {entry.lecturer?.full_name && (
                  <span className="text-sm text-gray-500">
                    · {entry.lecturer.full_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs text-gray-400">
                  {students.length} students
                </span>
                {isOpen
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
                }
              </div>
            </button>

            {/* Expandable student marker */}
            {isOpen && (
              <div className="border-t px-4 py-4 bg-gray-50">
                <AttendanceMarker
                  students={students}
                  timetableId={entry.id}
                  date={date}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}