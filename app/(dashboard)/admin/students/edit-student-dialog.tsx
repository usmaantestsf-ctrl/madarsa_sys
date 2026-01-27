'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Student = {
  id: string
  name: string
  nic: string | null
  phone: string | null
  address: string | null
  class_id: string
  guardian_name: string
  guardian_phone: string
  guardian_nic: string | null
  admission_number: string
  is_active: boolean
}

type Department = {
  id: string
  name: string
  type: string
}

type Class = {
  id: string
  name: string
  department_id: string
}

export function EditStudentDialog({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [formData, setFormData] = useState({
    name: student.name,
    nic: student.nic || '',
    phone: student.phone || '',
    address: student.address || '',
    department_id: '',
    class_id: student.class_id,
    guardian_name: student.guardian_name,
    guardian_phone: student.guardian_phone,
    guardian_nic: student.guardian_nic || '',
    admission_number: student.admission_number,
    is_active: student.is_active,
  })
  const router = useRouter()

  // Load data and set initial department
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    
    const [deptRes, classRes] = await Promise.all([
      supabase.from('departments').select('id, name, type').eq('is_active', true).order('name'),
      supabase.from('classes').select('id, name, department_id').eq('is_active', true).order('name')
    ])

    if (deptRes.data) setDepartments(deptRes.data)
    if (classRes.data) {
      setAllClasses(classRes.data)
      
      // Find the department of the current class
      const currentClass = classRes.data.find(c => c.id === student.class_id)
      if (currentClass) {
        setFormData(prev => ({ ...prev, department_id: currentClass.department_id }))
      }
    }
  }

  // Filter classes when department changes
  useEffect(() => {
    if (formData.department_id) {
      const filtered = allClasses.filter(c => c.department_id === formData.department_id)
      setFilteredClasses(filtered)
      
      // Reset class if not in new department
      if (formData.class_id) {
        const classStillValid = filtered.some(c => c.id === formData.class_id)
        if (!classStillValid) {
          setFormData(prev => ({ ...prev, class_id: '' }))
        }
      }
    } else {
      setFilteredClasses([])
    }
  }, [formData.department_id, allClasses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`/api/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      onClose()
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to update student')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIC (Optional)
                </label>
                <Input
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Department & Class Selection */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Department & Class</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                  disabled={!formData.department_id}
                >
                  <option value="">
                    {formData.department_id ? 'Select class' : 'Select department first'}
                  </option>
                  {filteredClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian NIC (Optional)
                </label>
                <Input
                  value={formData.guardian_nic}
                  onChange={(e) => setFormData({ ...formData, guardian_nic: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-4">
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Student'}
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
