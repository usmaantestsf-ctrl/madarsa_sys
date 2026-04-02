'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Clock, User, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TimetableEntry = {
  id: string
  class_id: string
  subject_id: string
  lecturer_id: string | null
  day_of_week: number
  time_slot_id: string
  subjects: {
    id: string
    name: string
  }
  lecturer: {
    lecturer_id: number
    full_name: string
  } | null
  classes: {
    id: string
    name: string
  }
  time_slots: {
    id: string
    slot_number: number
    start_time: string
    end_time: string
  }
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TimetableGrid({ timetable }: { timetable: TimetableEntry[] }) {
  const router = useRouter()
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return
    const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete timetable entry')
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const groupedByDay = daysOfWeek.map((day, index) => ({
    day,
    entries: timetable
      .filter((entry) => entry.day_of_week === index)
      .sort((a, b) => (a.time_slots?.slot_number ?? Infinity) - (b.time_slots?.slot_number ?? Infinity)),
  }))

  if (timetable.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No timetable entries found. Add your first entry!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {groupedByDay.map(({ day, entries }) => {
          if (entries.length === 0) return null
          return (
            <div key={day} className="border rounded-lg overflow-hidden">
              <div className="bg-primary-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-primary-900">{day}</h3>
              </div>
              <div className="divide-y">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold mr-1">
                            Slot {entry.time_slots?.slot_number}
                          </span>
                          {entry.time_slots?.start_time && entry.time_slots?.end_time && (
                            <>
                              {formatTime(entry.time_slots.start_time)} -{' '}
                              {formatTime(entry.time_slots.end_time)}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {entry.subjects?.name || 'Unknown Subject'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        {entry.lecturer?.full_name || 'No lecturer assigned'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}