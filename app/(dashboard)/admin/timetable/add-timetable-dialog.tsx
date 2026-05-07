'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Settings, Trash2 } from 'lucide-react'

type Subject = { id: string; name: string }
type Lecturer = { id: string; name: string }
type TimeSlot = { id: string; slot_number: number; start_time: string; end_time: string }

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]

export function AddTimetableDialog({
  classId,
  departmentId,
  dayOfWeek,
}: {
  classId: string
  departmentId: string
  dayOfWeek: number  // ← now comes from header, not picked in dialog
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'entry' | 'slots'>('entry')  // toggle between add entry / manage slots
  const [loading, setLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingLecturers, setLoadingLecturers] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  // New slot form state
  const [newSlot, setNewSlot] = useState({ slot_number: 1, start_time: '', end_time: '' })
  const [addingSlot, setAddingSlot] = useState(false)

  const [formData, setFormData] = useState({
    class_id: classId,
    subject_id: '',
    lecturer_id: '',
    time_slot_id: '',
  })
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchTimeSlots()
      fetchLecturers()
      fetchSubjects()
    }
  }, [open, departmentId, classId, dayOfWeek])

  // Reset form when dialog closes
  const handleClose = () => {
    setOpen(false)
    setView('entry')
    setFormData({ class_id: classId, subject_id: '', lecturer_id: '', time_slot_id: '' })
    setNewSlot({ slot_number: 1, start_time: '', end_time: '' })
  }

  const fetchTimeSlots = async () => {
    try {
      setLoadingSlots(true)
      const res = await fetch(
        `/api/time-slots?departmentId=${departmentId}&classId=${classId}&dayOfWeek=${dayOfWeek}`
      )
      if (res.ok) {
        const slots = await res.json()
        setTimeSlots(slots)
        // Auto-set next slot number
        setNewSlot((prev) => ({ ...prev, slot_number: slots.length + 1 }))
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
      if (res.ok) setLecturers(await res.json())
    } catch (err) {
      console.error('Error fetching lecturers:', err)
    } finally {
      setLoadingLecturers(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      const res = await fetch(`/api/subjects?departmentId=${departmentId}`)
      if (res.ok) setSubjects(await res.json())
    } catch (err) {
      console.error('Error fetching subjects:', err)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) return
    setAddingSlot(true)
    try {
      const res = await fetch('/api/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: departmentId,
          class_id: classId,
          day_of_week: dayOfWeek,
          slot_number: newSlot.slot_number,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
        }),
      })
      if (res.ok) {
        await fetchTimeSlots()  // refresh slot list
      } else {
        const data = await res.json()
        alert(data?.error || 'Failed to add slot')
      }
    } catch (err) {
      console.error('Error adding slot:', err)
    } finally {
      setAddingSlot(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Delete this time slot? Any timetable entries using it will also be deleted.')) return
    const res = await fetch(`/api/time-slots?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchTimeSlots()
      // Clear selection if deleted slot was selected
      if (formData.time_slot_id === id) {
        setFormData((prev) => ({ ...prev, time_slot_id: '' }))
      }
    } else {
      alert('Failed to delete slot')
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          day_of_week: dayOfWeek,  // from header
          lecturer_id: formData.lecturer_id || null,
        }),
      })

      if (res.ok) {
        handleClose()
        router.refresh()
      } else {
        const text = await res.text()
        const data = text ? JSON.parse(text) : null
        alert(data?.error || 'Failed to create timetable entry')
      }
    } catch (err) {
      console.error('Error creating timetable entry:', err)
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
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold">
            {view === 'entry' ? 'Add Timetable Entry' : 'Manage Time Slots'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Context badge */}
        <p className="text-xs text-gray-500 mb-4">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
            {daysOfWeek[dayOfWeek]}
          </span>
          {' '}— slots and entries are specific to this day
        </p>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('entry')}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${
              view === 'entry'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Add Entry
          </button>
          <button
            onClick={() => setView('slots')}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${
              view === 'slots'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-3 w-3 inline mr-1" />
            Manage Slots ({timeSlots.length})
          </button>
        </div>

        {/* ── VIEW: ADD ENTRY ── */}
        {view === 'entry' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot <span className="text-red-500">*</span>
              </label>
              {timeSlots.length === 0 && !loadingSlots ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                  No slots defined for {daysOfWeek[dayOfWeek]} yet.{' '}
                  <button
                    type="button"
                    className="underline font-medium"
                    onClick={() => setView('slots')}
                  >
                    Add slots first
                  </button>
                </div>
              ) : (
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
                      Slot {slot.slot_number} — {formatTime(slot.start_time)} to {formatTime(slot.end_time)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
                disabled={loadingSubjects}
              >
                <option value="">
                  {loadingSubjects ? 'Loading subjects...' : 'Select subject'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lecturer */}
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

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading || timeSlots.length === 0}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Entry'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* ── VIEW: MANAGE SLOTS ── */}
        {view === 'slots' && (
          <div className="space-y-4">
            {/* Existing slots */}
            {loadingSlots ? (
              <p className="text-sm text-gray-400">Loading slots...</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-gray-400">No slots yet. Add one below.</p>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                  >
                    <span className="text-sm">
                      <span className="font-semibold">Slot {slot.slot_number}</span>{' '}
                      — {formatTime(slot.start_time)} to {formatTime(slot.end_time)}
                    </span>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new slot form */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Add New Slot</p>
              <div className="flex items-end gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Slot #</label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={newSlot.slot_number}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, slot_number: parseInt(e.target.value) })
                    }
                    className="h-8 w-16 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Start</label>
                  <Input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">End</label>
                  <Input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSlot}
                  disabled={addingSlot || !newSlot.start_time || !newSlot.end_time}
                  className="mb-0.5"
                >
                  {addingSlot ? '...' : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setView('entry')}>
                ← Back to Add Entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}