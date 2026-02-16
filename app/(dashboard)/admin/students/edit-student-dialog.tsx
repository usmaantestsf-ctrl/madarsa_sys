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
  father_status: string | null
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
  is_passed: boolean // ADDED
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
    father_status: student.father_status || '',
    madrasa_grade: student.madrasa_grade,
    usthadh_name: student.usthadh_name || '',
    usthadh_contact_number: student.usthadh_contact_number || '',
    school_grade: student.school_grade || '',
    section: student.section || '',
    district: student.district || '',
    address: student.address || '',
    contact_number: student.contact_number || '',
    is_active: student.is_active,
    is_passed: student.is_passed || false, // ADDED
  })
  const router = useRouter()

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Edit Student</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Admission No *
                </label>
                <Input
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date of Admission *
                </label>
                <Input
                  type="date"
                  value={formData.date_of_admission}
                  onChange={(e) => setFormData({ ...formData, date_of_admission: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name with Initial *
                </label>
                <Input
                  value={formData.name_with_initial}
                  onChange={(e) => setFormData({ ...formData, name_with_initial: e.target.value })}
                  placeholder="e.g., M.A. Hassan"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., Mohamed Ali Hassan"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                <Input value={calculateAge(formData.date_of_birth)} disabled />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
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

          {/* Father Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Father Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Father *</label>
                <Input
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  placeholder="e.g., Ali Hassan"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
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
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Academic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Class (in Madrasa) *
                </label>
                <select
                  value={formData.madrasa_grade}
                  onChange={(e) => setFormData({ ...formData, madrasa_grade: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                  disabled={loadingClasses}
                >
                  <option value="">{loadingClasses ? 'Loading classes...' : 'Select class'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Section</label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Class Usthadh
                </label>
                <Input
                  value={formData.usthadh_name}
                  onChange={(e) => setFormData({ ...formData, usthadh_name: e.target.value })}
                  placeholder="e.g., Usthadh Ahmed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Usthadh Contact Number
                </label>
                <Input
                  value={formData.usthadh_contact_number}
                  onChange={(e) =>
                    setFormData({ ...formData, usthadh_contact_number: e.target.value })
                  }
                  placeholder="e.g., 0771234567"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., Colombo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <Input
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="e.g., 0771234567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Status Section - ADDED */}
          {/* Status Section - UPDATED */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Student Status *</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="student_status"
                  checked={formData.is_active && !formData.is_passed}
                  onChange={() => setFormData({ ...formData, is_active: true, is_passed: false })}
                  className="border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Active Student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="student_status"
                  checked={formData.is_passed}
                  onChange={() => setFormData({ ...formData, is_active: false, is_passed: true })}
                  className="border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Passed Out</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="student_status"
                  checked={!formData.is_active && !formData.is_passed}
                  onChange={() => setFormData({ ...formData, is_active: false, is_passed: false })}
                  className="border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Inactive</span>
              </label>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
