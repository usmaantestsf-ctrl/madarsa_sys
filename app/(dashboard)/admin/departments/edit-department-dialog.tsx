'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

type Department = {
  id: string
  name: string
  type: 'full-time' | 'part-time' | 'special'
  is_active: boolean
  incharge_lecturer_id: number | null
}

type Lecturer = {
  lecturer_id: number
  visual_name: string | null
  full_name: string
}

export function EditDepartmentDialog({
  department,
  lecturers,
  onClose,
}: {
  department: Department
  lecturers: Lecturer[]
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: department.name,
    type: department.type,
    is_active: department.is_active,
    incharge_lecturer_id: department.incharge_lecturer_id?.toString() || '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/departments/${department.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        type: formData.type,
        is_active: formData.is_active,
        incharge_lecturer_id: formData.incharge_lecturer_id
          ? Number(formData.incharge_lecturer_id)
          : null,
      }),
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Department</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Department Name</label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
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
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">In-Charge Teacher</label>
            <select
              value={formData.incharge_lecturer_id}
              onChange={e => setFormData({ ...formData, incharge_lecturer_id: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {lecturers.map(l => (
                <option key={l.lecturer_id} value={l.lecturer_id}>
                  {l.visual_name ?? l.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
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