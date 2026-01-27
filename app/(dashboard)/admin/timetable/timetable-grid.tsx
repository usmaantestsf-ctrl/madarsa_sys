'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TimetableEntry = {
  id: string
  day_of_week: number
  classes: { id: string; name: string }
  subjects: { id: string; name: string }
  lecturers: { id: string; name: string }
  time_slots: { id: string; slot_number: number; start_time: string; end_time: string }
}

type TimeSlot = {
  id: string
  slot_number: number
  start_time: string
  end_time: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function TimetableGrid({ 
  timetable, 
  timeSlots 
}: { 
  timetable: TimetableEntry[]
  timeSlots: TimeSlot[]
}) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return

    const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' })
    
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete entry')
    }
  }

  // Group timetable by day and time slot
  const getTimetableEntry = (day: number, slotNumber: number) => {
    return timetable.filter(
      (entry) => entry.day_of_week === day && entry.time_slots.slot_number === slotNumber
    )
  }

  if (timetable.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No timetable entries found. Create your first schedule!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 w-32">
              Time Slot
            </th>
            {DAYS.map((day, idx) => (
              <th key={idx} className="border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="border border-gray-200 px-3 py-2 bg-gray-50">
                <div className="text-xs font-medium text-gray-900">Slot {slot.slot_number}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {slot.start_time} - {slot.end_time}
                </div>
              </td>
              {DAYS.map((_, dayIdx) => {
                const entries = getTimetableEntry(dayIdx, slot.slot_number)
                
                return (
                  <td key={dayIdx} className="border border-gray-200 px-2 py-2 align-top">
                    {entries.length > 0 ? (
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div key={entry.id} className="bg-primary-50 rounded p-2 text-xs">
                            <div className="font-semibold text-primary-900">{entry.subjects.name}</div>
                            <div className="text-gray-700 mt-1">Class: {entry.classes.name}</div>
                            <div className="text-gray-600">Lecturer: {entry.lecturers.name}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="mt-2 w-full text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-xs py-4">-</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
