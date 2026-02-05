'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

type Student = {
  id: string
  admission_number: string
  name_with_initial: string
  full_name: string
  date_of_birth: string
  nic_number: string | null
  date_of_admission: string
  father_name: string
  father_status: string | null // ADDED
  madrasa_grade: string
  class_id: string | null
  usthadh_name: string | null
  usthadh_contact_number: string | null
  school_grade: string | null
  section: string | null
  district: string | null
  address: string | null
  contact_number: string | null
  is_active: boolean
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
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  
  const [formData, setFormData] = useState({
    admission_number: student.admission_number,
    name_with_initial: student.name_with_initial,
    full_name: student.full_name,
    date_of_birth: student.date_of_birth,
    nic_number: student.nic_number || '',
    date_of_admission: student.date_of_admission,
    father_name: student.father_name,
    father_status: student.father_status || '', // ADDED
    madrasa_grade: student.madrasa_grade,
    usthadh_name: student.usthadh_name || '',
    usthadh_contact_number: student.usthadh_contact_number || '',
    school_grade: student.school_grade || '',
    section: student.section || '',
    district: student.district || '',
    address: student.address || '',
    contact_number: student.contact_number || '',
    is_active: student.is_active,
  })
  const router = useRouter()

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

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

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return ''
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission No <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Admission <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date_of_admission}
                  onChange={(e) => setFormData({ ...formData, date_of_admission: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name with Initial <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name_with_initial}
                  onChange={(e) => setFormData({ ...formData, name_with_initial: e.target.value })}
                  placeholder="e.g., M.A. Hassan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., Mohamed Ali Hassan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <Input
                  value={formData.date_of_birth ? `${calculateAge(formData.date_of_birth)} years` : ''}
                  disabled
                  placeholder="Auto-calculated"
                  className="bg-gray-50"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N.I.C Number
                </label>
                <Input
                  value={formData.nic_number}
                  onChange={(e) => setFormData({ ...formData, nic_number: e.target.value })}
                  placeholder="e.g., 200512345678"
                />
              </div>
            </div>
          </div>

          {/* Father Information - UPDATED SECTION */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Father Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  placeholder="e.g., Ali Hassan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Status
                </label>
                <select
                  value={formData.father_status}
                  onChange={(e) => setFormData({ ...formData, father_status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select status</option>
                  <option value="YES">Alive</option>
                  <option value="NO">Deceased</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class (in Madrasa) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.madrasa_grade}
                  onChange={(e) => setFormData({ ...formData, madrasa_grade: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                  disabled={loadingClasses}
                >
                  <option value="">
                    {loadingClasses ? 'Loading classes...' : 'Select class'}
                  </option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (in School Subjects)
                </label>
                <select
                  value={formData.school_grade}
                  onChange={(e) => setFormData({ ...formData, school_grade: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select grade</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Grade 13">Grade 13</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Usthadh
                </label>
                <Input
                  value={formData.usthadh_name}
                  onChange={(e) => setFormData({ ...formData, usthadh_name: e.target.value })}
                  placeholder="e.g., Usthadh Ahmed"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usthadh Contact Number
                </label>
                <Input
                  value={formData.usthadh_contact_number}
                  onChange={(e) => setFormData({ ...formData, usthadh_contact_number: e.target.value })}
                  placeholder="e.g., 0771234567"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <Input
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="e.g., 0771234567"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
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