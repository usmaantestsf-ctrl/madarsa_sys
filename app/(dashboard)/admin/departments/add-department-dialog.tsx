'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Trash2 } from 'lucide-react'

type TimeSlot = {
  slot_number: number
  start_time: string
  end_time: string
}

export function AddDepartmentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'special',
  })
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const router = useRouter()

  const addSlot = () => {
    const nextSlotNumber = timeSlots.length + 1
    setTimeSlots([
      ...timeSlots,
      { slot_number: nextSlotNumber, start_time: '', end_time: '' },
    ])
  }

  const removeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    setTimeSlots(timeSlots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, time_slots: timeSlots }),
    })

    if (res.ok) {
      setOpen(false)
      setFormData({ name: '', type: 'full-time' })
      setTimeSlots([])
      router.refresh()
    } else {
      const data = await res.json()
      alert(data?.error || 'Failed to create department')
    }

    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Department</h2>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Info */}
          <div>
            <label className="mb-1 block text-sm font-medium">Department Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="special">Special</option>
            </select>
          </div>

          {/* Time Slots */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Time Slots</label>
              <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                <Plus className="mr-1 h-3 w-3" />
                Add Slot
              </Button>
            </div>

            {timeSlots.length === 0 ? (
              <p className="text-sm text-gray-400">No time slots yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Slot #</label>
                      <Input
                        type="number"
                        value={slot.slot_number}
                        onChange={(e) => updateSlot(index, 'slot_number', parseInt(e.target.value))}
                        className="h-8 w-16 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Start</label>
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">End</label>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="mb-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Department'}
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