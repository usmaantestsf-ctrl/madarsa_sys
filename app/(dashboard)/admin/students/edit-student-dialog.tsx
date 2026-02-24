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
  department_id: string | null
  department: string | null
  usthadh_name: string | null
  usthadh_contact_number: string | null
  school_grade: string | null
  district: string | null
  address: string | null
  contact_number: string | null
  is_active: boolean
  is_passed: boolean
}

type Department = {
  id: string
  name: string
  type: string
  is_active: boolean
}

// ✅ Qualifications list — add new ones here anytime
const QUALIFICATIONS = [
  'Hafiz',
  'Alim',
  'Hafiz & Alim',
]

export function EditStudentDialog({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [formData, setFormData] = useState({
    admission_number: student.admission_number,
    name_with_initial: student.name_with_initial,
    full_name: student.full_name,
    date_of_birth: student.date_of_birth,
    nic_number: student.nic_number || '',
    date_of_admission: student.date_of_admission,
    father_name: student.father_name,
    father_status: student.father_status || '',
    department_id: student.department_id || '',
    department: student.department || '',
    madrasa_grade: student.madrasa_grade,
    usthadh_name: student.usthadh_name || '',
    usthadh_contact_number: student.usthadh_contact_number || '',
    school_grade: student.school_grade || '',
    district: student.district || '',
    address: student.address || '',
    contact_number: student.contact_number || '',
    is_active: student.is_active,
    is_passed: student.is_passed || false,
    qualification: '',       // ✅ NEW
    passed_out_date: '',     // ✅ NEW
  })

  const router = useRouter()

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.filter((d: Department) => d.is_active))
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoadingDepartments(false)
    }
  }

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDept = departments.find(d => d.id === e.target.value)
    setFormData({
      ...formData,
      department_id: e.target.value,
      department: selectedDept?.name || '',
      madrasa_grade: selectedDept?.name || '',
    })
  }

  // ✅ When status changes, reset qualification if not passed out
  const handleStatusChange = (status: 'active' | 'passed' | 'inactive') => {
    if (status === 'active') {
      setFormData({ ...formData, is_active: true, is_passed: false, qualification: '', passed_out_date: '' })
    } else if (status === 'passed') {
      setFormData({ ...formData, is_active: false, is_passed: true })
    } else {
      setFormData({ ...formData, is_active: false, is_passed: false, qualification: '', passed_out_date: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ Validate qualification if passed out
    if (formData.is_passed && !formData.qualification) {
      alert('Please select a qualification for passed out student.')
      return
    }

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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Admission No *</label>
                <Input value={formData.admission_number} onChange={e => setFormData({ ...formData, admission_number: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date of Admission *</label>
                <Input type="date" value={formData.date_of_admission} onChange={e => setFormData({ ...formData, date_of_admission: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name with Initial *</label>
                <Input value={formData.name_with_initial} onChange={e => setFormData({ ...formData, name_with_initial: e.target.value })} placeholder="e.g., M.A. Hassan" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name *</label>
                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g., Mohamed Ali Hassan" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date of Birth *</label>
                <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Age</label>
                <Input value={calculateAge(formData.date_of_birth)} readOnly className="bg-gray-50" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">N.I.C Number</label>
                <Input value={formData.nic_number} onChange={e => setFormData({ ...formData, nic_number: e.target.value })} placeholder="e.g., 200512345678" />
              </div>
            </div>
          </div>

          {/* Father Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Father Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Father Name *</label>
                <Input value={formData.father_name} onChange={e => setFormData({ ...formData, father_name: e.target.value })} placeholder="e.g., Ali Hassan" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Father Status</label>
                <select value={formData.father_status} onChange={e => setFormData({ ...formData, father_status: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select status</option>
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Department (Madrasa Class) *</label>
                <select value={formData.department_id} onChange={handleDepartmentChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">{loadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.type})</option>
                  ))}
                </select>
                {formData.madrasa_grade && (
                  <p className="text-xs text-blue-600 mt-1">Madrasa Grade → {formData.madrasa_grade}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Grade (School Subjects)</label>
                <select value={formData.school_grade} onChange={e => setFormData({ ...formData, school_grade: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select grade</option>
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Class Usthadh</label>
                <Input value={formData.usthadh_name} onChange={e => setFormData({ ...formData, usthadh_name: e.target.value })} placeholder="e.g., Usthadh Ahmed" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Usthadh Contact Number</label>
                <Input value={formData.usthadh_contact_number} onChange={e => setFormData({ ...formData, usthadh_contact_number: e.target.value })} placeholder="e.g., 0771234567" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">District</label>
                <Input value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="e.g., Colombo" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Contact Number</label>
                <Input value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} placeholder="e.g., 0771234567" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Address</label>
                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]" />
              </div>
            </div>
          </div>

          {/* Student Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Status</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="status" checked={formData.is_active && !formData.is_passed} onChange={() => handleStatusChange('active')} />
                Active Student
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="status" checked={formData.is_passed} onChange={() => handleStatusChange('passed')} />
                Passed Out
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="status" checked={!formData.is_active && !formData.is_passed} onChange={() => handleStatusChange('inactive')} />
                Inactive
              </label>
            </div>

            {/* ✅ Qualification section — only shows when Passed Out is selected */}
            {formData.is_passed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-green-700">📜 Passed Out Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Qualification *</label>
                    <select
                      value={formData.qualification}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select qualification</option>
                      {QUALIFICATIONS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Passed Out Date *</label>
                    <Input
                      type="date"
                      value={formData.passed_out_date}
                      onChange={e => setFormData({ ...formData, passed_out_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Student'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
