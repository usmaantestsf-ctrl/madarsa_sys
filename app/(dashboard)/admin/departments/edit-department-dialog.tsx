'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, Trash2 } from 'lucide-react'

type Department = {
  id: string
  name: string
  type: 'full-time' | 'part-time' | 'special'
  is_active: boolean
}

type TimeSlot = {
  id?: string
  slot_number: number
  start_time: string
  end_time: string
}

export function EditDepartmentDialog({
  department,
  onClose,
}: {
  department: Department
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [formData, setFormData] = useState({
    name: department.name,
    type: department.type,
    is_active: department.is_active,
  })
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      setLoadingSlots(true)
      const res = await fetch(`/api/time-slots?departmentId=${department.id}`)
      if (res.ok) setTimeSlots(await res.json())
    } catch (err) {
      console.error('Error fetching time slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

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

    const res = await fetch(`/api/departments/${department.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, time_slots: timeSlots }),
    })

    if (res.ok) {
      onClose()
      router.refresh()
    } else {
      const data = await res.json()
      alert(data?.error || 'Failed to update department')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Department</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Slots
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            </div>

            {loadingSlots ? (
              <p className="text-sm text-gray-500">Loading slots...</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No time slots yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <div className="w-16">
                      <label className="block text-xs text-gray-500 mb-1">Slot #</label>
                      <Input
                        type="number"
                        min={1}
                        max={8}
                        value={slot.slot_number}
                        onChange={(e) => updateSlot(index, 'slot_number', parseInt(e.target.value))}
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Start</label>
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">End</label>
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
                      className="mt-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Department'}
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