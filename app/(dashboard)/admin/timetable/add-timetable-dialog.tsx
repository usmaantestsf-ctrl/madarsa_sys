'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

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
  { value: 6, label: 'Sunday' },
]

export function AddTimetableDialog({
  classId,
  subjects,
  lecturers,
}: {
  classId: string
  subjects: Subject[]
  lecturers: Lecturer[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [formData, setFormData] = useState({
    class_id: classId,
    subject_id: '',
    lecturer_id: '',
    day_of_week: 0,
    time_slot_id: '',
  })
  const router = useRouter()

  // Fetch time slots when dialog opens
  useEffect(() => {
    if (open) {
      fetchTimeSlots()
    }
  }, [open])

  const fetchTimeSlots = async () => {
    try {
      setLoadingSlots(true)
      const res = await fetch('/api/time-slots')
      if (res.ok) {
        const data = await res.json()
        setTimeSlots(data)
      } else {
        console.error('Failed to fetch time slots')
      }
    } catch (err) {
      console.error('Error fetching time slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  // Format time to display (HH:MM AM/PM)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get selected time slot details
  const selectedTimeSlot = timeSlots.find(
    (slot) => slot.id === formData.time_slot_id
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setOpen(false)
        setFormData({
          class_id: classId,
          subject_id: '',
          lecturer_id: '',
          day_of_week: 0,
          time_slot_id: '',
        })
        router.refresh()
      } else {
        let errorMsg = 'Failed to create timetable entry'
        const text = await res.text()
        try {
          const data = text ? JSON.parse(text) : null
          errorMsg = data?.error || errorMsg
        } catch (err) {
          console.warn('Response is not JSON:', err)
        }
        alert(errorMsg)
      }
    } catch (err) {
      console.error('Network or server error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Entry
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Timetable Entry</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
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
              Lecturer <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.lecturer_id}
              onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Select lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
