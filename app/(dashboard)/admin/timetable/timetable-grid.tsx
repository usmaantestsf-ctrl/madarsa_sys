'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Clock, User, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditTimetableDialog } from './edit-timetable-dialog'

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

type Subject = { id: string; name: string }

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday']

export function TimetableGrid({
  timetable,
  departmentId,
}: {
  timetable: TimetableEntry[]
  departmentId: string
}) {
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
      .sort(
        (a, b) =>
          (a.time_slots?.slot_number ?? Infinity) -
          (b.time_slots?.slot_number ?? Infinity)
      ),
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
            <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{day}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-xs font-medium text-gray-500 w-14">
                        Slot {entry.time_slots?.slot_number}
                      </div>

                      {entry.time_slots?.start_time && entry.time_slots?.end_time && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 w-36">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatTime(entry.time_slots.start_time)} –{' '}
                          {formatTime(entry.time_slots.end_time)}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <BookOpen className="h-3 w-3 text-blue-600 shrink-0" />
                        {entry.subjects?.name || 'Unknown Subject'}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="h-3 w-3 shrink-0" />
                        {entry.lecturer?.full_name || 'No lecturer assigned'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEntry(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
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

      {/* Edit dialog */}
      {editingEntry && (
        <EditTimetableDialog
          entry={{
            ...editingEntry,
            // Normalise lecturer shape: grid stores { lecturer_id, full_name }
            // but dialog expects { id, name } via lecturers prop
            lecturers: editingEntry.lecturer
              ? {
                  id: String(editingEntry.lecturer.lecturer_id),
                  name: editingEntry.lecturer.full_name,
                }
              : null,
          }}
          departmentId={departmentId}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  )
}