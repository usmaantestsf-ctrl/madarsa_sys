'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

type Class = {
  id: string
  name: string
  department_id: string
  default_strength: number
  is_active: boolean
  incharge_lecturer_id: number | null // ✅ ADDED
}
type Department = { id: string; name: string; type: string }
type Lecturer = { lecturer_id: number; full_name: string } // ✅ ADDED

export function EditClassDialog({
  classItem,
  departments,
  lecturers, // ✅ ADDED
  onClose,
}: {
  classItem: Class
  departments: Department[]
  lecturers: Lecturer[] // ✅ ADDED
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: classItem.name,
    department_id: classItem.department_id,
    default_strength: classItem.default_strength,
    is_active: classItem.is_active,
    incharge_lecturer_id: classItem.incharge_lecturer_id?.toString() || '', // ✅ ADDED
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/classes/${classItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        // ✅ Send null if cleared, or integer ID
        incharge_lecturer_id: formData.incharge_lecturer_id
          ? Number(formData.incharge_lecturer_id)
          : null,
      }),
    })
    if (res.ok) {
      onClose()
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to update class')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Class</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Existing: Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <Input
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          {/* Existing: Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={formData.department_id}
              onChange={e => setFormData(p => ({ ...p, department_id: e.target.value }))}
              required
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Existing: Default Strength */}
          <div>
            <label className="block text-sm font-medium mb-1">Default Strength</label>
            <Input
              type="number"
              value={formData.default_strength}
              onChange={e => setFormData(p => ({ ...p, default_strength: Number(e.target.value) }))}
              min={0}
              required
            />
          </div>

          {/* Existing: Active toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>

          {/* ✅ NEW: In-Charge Teacher */}
          <div>
            <label className="block text-sm font-medium mb-1">In-Charge Teacher</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={formData.incharge_lecturer_id}
              onChange={e => setFormData(p => ({ ...p, incharge_lecturer_id: e.target.value }))}
            >
              <option value="">— None —</option>
              {lecturers.map(l => (
                <option key={l.lecturer_id} value={l.lecturer_id}>
                  {l.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
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