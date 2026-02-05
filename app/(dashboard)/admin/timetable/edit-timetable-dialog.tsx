'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type TimetableEntry = {
  id: string
  class_id: string
  subject_id: string
  lecturer_id: string | null
  day_of_week: number
  time_slot_id: string
  time_slots: {
    id: string
    slot_number: number
    start_time: string
    end_time: string
  }
  subjects: {
    id: string
    name: string
  }
  lecturers: {
    id: string
    name: string
  } | null
}

type Subject = {
  id: string
  name: string
}

type Lecturer = {
  id: string
  name: string
}

type TimeSlot = {
  id: string
  slot_number: number
  start_time: string
  end_time: string
}

const daysOfWeek = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
]

export function EditTimetableDialog({
  entry,
  subjects,
  onClose,
}: {
  entry: TimetableEntry
  subjects: Subject[]
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [loadingLecturers, setLoadingLecturers] = useState(true)
  const [formData, setFormData] = useState({
    subject_id: entry.subject_id,
    lecturer_id: entry.lecturer_id || '',
    day_of_week: entry.day_of_week,
    time_slot_id: entry.time_slot_id,
  })
  const router = useRouter()

  useEffect(() => {
    fetchTimeSlots()
    fetchLecturers()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      setLoadingSlots(true)
      const res = await fetch('/api/time-slots')
      if (res.ok) {
        const data = await res.json()
        setTimeSlots(data)
      }
    } catch (err) {
      console.error('Error fetching time slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const fetchLecturers = async () => {
    try {
      setLoadingLecturers(true)
      const res = await fetch('/api/lecturers/list')
      if (res.ok) {
        const data = await res.json()
        setLecturers(data)
      }
    } catch (err) {
      console.error('Error fetching lecturers:', err)
    } finally {
      setLoadingLecturers(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const selectedTimeSlot = timeSlots.find(
    (slot) => slot.id === formData.time_slot_id
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        lecturer_id: formData.lecturer_id || null,
      }

      const res = await fetch(`/api/timetable/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onClose()
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update timetable entry')
      }
    } catch (err) {
      console.error('Error updating timetable:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Timetable Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.day_of_week}
              onChange={(e) =>
                setFormData({ ...formData, day_of_week: parseInt(e.target.value) })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            >
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.time_slot_id}
              onChange={(e) => setFormData({ ...formData, time_slot_id: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
              disabled={loadingSlots}
            >
              <option value="">
                {loadingSlots ? 'Loading slots...' : 'Select time slot'}
              </option>
              {timeSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  Slot {slot.slot_number} - {formatTime(slot.start_time)} to{' '}
                  {formatTime(slot.end_time)}
                </option>
              ))}
            </select>
            {selectedTimeSlot && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <strong>Selected Time:</strong> {formatTime(selectedTimeSlot.start_time)} -{' '}
                {formatTime(selectedTimeSlot.end_time)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecturer
            </label>
            <select
              value={formData.lecturer_id}
              onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              disabled={loadingLecturers}
            >
              <option value="">
                {loadingLecturers ? 'Loading lecturers...' : 'Select lecturer (optional)'}
              </option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}