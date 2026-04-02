'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Upload, Download } from 'lucide-react'

type Department = {
  id: string
  name: string
  type: string
  is_active: boolean
}

type Class = {
  id: string
  name: string
  department_id: string
  default_strength: number
  is_active: boolean
}

export function AddStudentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [uploadMode, setUploadMode] = useState<'form' | 'csv'>('form')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentYear = new Date().getFullYear().toString()

  const initialFormData = {
    admission_number: '',
    name_with_initial: '',
    full_name: '',
    date_of_birth: '',
    nic_number: '',
    date_of_admission: new Date().toISOString().split('T')[0],
    father_name: '',
    father_status: '',
    department_id: '',
    department: '',
    madrasa_grade: '',
    usthadh_name: '',
    usthadh_contact_number: '',
    school_grade: '',
    district: '',
    address: '',
    contact_number: '',
    // ✅ Enrollment fields
    class_id: '',
    academic_year: currentYear,
  }

  const [formData, setFormData] = useState(initialFormData)
  const router = useRouter()

  useEffect(() => {
    if (open) fetchDepartments()
  }, [open])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const res = await fetch('/api/departments?active=true')
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

  // ✅ Fetch classes when department changes
  const fetchClasses = async (departmentId: string) => {
    setLoadingClasses(true)
    setClasses([])
    setFormData(prev => ({ ...prev, class_id: '' }))
    try {
      const res = await fetch(`/api/classes?department_id=${departmentId}&active=true`)
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

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDept = departments.find(d => d.id === e.target.value)
    setFormData({
      ...formData,
      department_id: e.target.value,
      department: selectedDept?.name || '',
      madrasa_grade: '',
      class_id: '', // reset class when dept changes
    })
    if (e.target.value) {
      fetchClasses(e.target.value) // ✅ load classes for selected dept
    } else {
      setClasses([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ Validate enrollment fields
    if (!formData.class_id) {
      alert('Please select a class for enrollment.')
      return
    }
    if (!formData.academic_year) {
      alert('Please enter the academic year.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setOpen(false)
      setFormData(initialFormData)
      setClasses([])
      router.refresh()
      alert('Student created and enrolled successfully!')
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to create student')
    }

    setLoading(false)
  }

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) { alert('Please select a CSV file'); return }

    setLoading(true)
    setUploadProgress('Processing CSV file...')

    const data = new FormData()
    data.append('file', csvFile)

    try {
      const res = await fetch('/api/students/bulk-upload', { method: 'POST', body: data })
      const result = await res.json()

      if (res.ok) {
        setUploadProgress(
          `✓ ${result.message}\n\n${result.errors?.length > 0 ? `Errors:\n${result.errors.join('\n')}` : ''}`
        )
        if (result.successful > 0) {
          setTimeout(() => {
            setOpen(false)
            setCsvFile(null)
            setUploadProgress('')
            router.refresh()
          }, 3000)
        }
      } else {
        const details = result.details ? `\n\nDetails: ${JSON.stringify(result.details, null, 2)}` : ''
        const errorList = result.errors?.length > 0 ? `\n\nErrors:\n${result.errors.join('\n')}` : ''
        alert(`${result.error || 'Failed to upload CSV'}${details}${errorList}`)
        setUploadProgress('')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Network error: Failed to upload CSV file.')
      setUploadProgress('')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `admission_number,name_with_initial,full_name,date_of_birth,nic_number,date_of_admission,father_name,father_status,department_id,madrasa_grade,usthadh_name,usthadh_contact_number,school_grade,district,address,contact_number
ADM2026001,M.A. Hassan,Mohamed Ali Hassan,2010-05-15,200512345678,2026-01-10,Ali Hassan,Alive,<department-uuid>,Grade 5,Usthadh Ahmed,0771234567,Grade 6,Colombo,"123 Main Street, Colombo",0779876543`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Student
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Student</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            {(['form', 'csv'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setUploadMode(mode)}
                className={`px-4 py-2 font-medium transition-colors ${
                  uploadMode === mode
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'form' ? 'Single Entry' : 'Bulk Upload (CSV)'}
              </button>
            ))}
          </div>
        </div>

        {/* CSV UPLOAD */}
        {uploadMode === 'csv' ? (
          <form onSubmit={handleCsvUpload} className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-blue-900 mb-2">CSV Format Instructions</h4>
              <p className="text-blue-700 font-mono text-xs mb-3 break-all">
                admission_number, name_with_initial, full_name, date_of_birth, nic_number,
                date_of_admission, father_name, father_status, department_id, madrasa_grade,
                usthadh_name, usthadh_contact_number, school_grade, district, address, contact_number
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Required: admission_number, name_with_initial, full_name, date_of_birth, date_of_admission, father_name, department_id</li>
                <li>Date format: YYYY-MM-DD</li>
                <li>father_status: Alive or Deceased</li>
                <li>department_id: Valid UUID from departments table</li>
              </ul>
            </div>

            <Button type="button" onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            <div>
              <input ref={fileInputRef} type="file" accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) { setCsvFile(file); setUploadProgress('') }
                }}
                className="hidden"
              />
              {csvFile ? (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 bg-green-50">
                  <p className="text-center text-green-700 font-medium mb-3">{csvFile.name}</p>
                  <Button type="button" variant="outline"
                    onClick={() => { setCsvFile(null); setUploadProgress(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="w-full"
                  >Choose Different File</Button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Select CSV File</p>
                  <p className="text-gray-500 text-sm">or drag and drop here</p>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">{uploadProgress}</pre>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={!csvFile || loading} className="flex-1">
                {loading ? 'Uploading...' : 'Upload Students'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>

        ) : (
        /* SINGLE ENTRY FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission No *</label>
                  <Input value={formData.admission_number} onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })} placeholder="e.g., ADM2026001" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Admission *</label>
                  <Input type="date" value={formData.date_of_admission} onChange={(e) => setFormData({ ...formData, date_of_admission: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name with Initial *</label>
                <Input value={formData.name_with_initial} onChange={(e) => setFormData({ ...formData, name_with_initial: e.target.value })} placeholder="e.g., M.A. Hassan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g., Mohamed Ali Hassan" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <Input value={calculateAge(formData.date_of_birth)} disabled className="bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N.I.C Number</label>
                <Input value={formData.nic_number} onChange={(e) => setFormData({ ...formData, nic_number: e.target.value })} placeholder="e.g., 200512345678" />
              </div>
            </div>

            {/* Father Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Father Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label>
                <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} placeholder="e.g., Ali Hassan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father Status</label>
                <select value={formData.father_status} onChange={(e) => setFormData({ ...formData, father_status: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select status</option>
                  <option value="Alive">Alive</option>
                  <option value="Deceased">Deceased</option>
                </select>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Academic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select value={formData.department_id} onChange={handleDepartmentChange}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required disabled={loadingDepartments}>
                  <option value="">{loadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.type})</option>
                  ))}
                </select>
              </div>

              {/* ✅ Class dropdown — appears after department is selected */}
              {formData.department_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class (Grade) *</label>
                  <select value={formData.class_id}
                    onChange={(e) => {
                      const selectedClass = classes.find(c => c.id === e.target.value)
                      setFormData({
                        ...formData,
                        class_id: e.target.value,
                        madrasa_grade: selectedClass?.name || '',   // ← stores the class name e.g. "Grade 5"
                      })
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required disabled={loadingClasses}>
                    <option value="">{loadingClasses ? 'Loading classes...' : 'Select class'}</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  {classes.length === 0 && !loadingClasses && (
                    <p className="text-xs text-red-500 mt-1">⚠️ No classes found for this department. Add classes first.</p>
                  )}
                </div>
              )}

              {/* ✅ Academic Year — manually editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                  <span className="text-xs text-gray-400 ml-2">(e.g. 2026 or Ramadan 1447)</span>
                </label>
                <Input
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="e.g., 2026 or Ramadan 1447"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade (School Subjects)</label>
                <select value={formData.school_grade} onChange={(e) => setFormData({ ...formData, school_grade: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select grade</option>
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Usthadh</label>
                <Input value={formData.usthadh_name} onChange={(e) => setFormData({ ...formData, usthadh_name: e.target.value })} placeholder="e.g., Usthadh Ahmed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usthadh Contact Number</label>
                <Input value={formData.usthadh_contact_number} onChange={(e) => setFormData({ ...formData, usthadh_contact_number: e.target.value })} placeholder="e.g., 0771234567" />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="e.g., Colombo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="e.g., 0771234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Student & Enroll'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
