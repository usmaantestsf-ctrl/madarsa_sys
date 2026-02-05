'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Upload, Download } from 'lucide-react'

type Class = {
  id: string
  name: string
  department_id: string
}

export function AddStudentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [uploadMode, setUploadMode] = useState<'form' | 'csv'>('form')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    admission_number: '',
    name_with_initial: '',
    full_name: '',
    date_of_birth: '',
    nic_number: '',
    date_of_admission: new Date().toISOString().split('T')[0],
    father_name: '',
    father_status: '', // ADDED
    madrasa_grade: '',
    usthadh_name: '',
    usthadh_contact_number: '',
    school_grade: '',
    section: '',
    district: '',
    address: '',
    contact_number: '',
  })
  const router = useRouter()

  // Fetch classes when dialog opens
  useEffect(() => {
    if (open) {
      fetchClasses()
    }
  }, [open])

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

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setOpen(false)
      setFormData({
        admission_number: '',
        name_with_initial: '',
        full_name: '',
        date_of_birth: '',
        nic_number: '',
        date_of_admission: new Date().toISOString().split('T')[0],
        father_name: '',
        father_status: '', // ADDED
        madrasa_grade: '',
        usthadh_name: '',
        usthadh_contact_number: '',
        school_grade: '',
        section: '',
        district: '',
        address: '',
        contact_number: '',
      })
      router.refresh()
      alert('Student created successfully!')
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to create student')
    }
    
    setLoading(false)
  }

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) {
      alert('Please select a CSV file')
      return
    }

    setLoading(true)
    setUploadProgress('Processing CSV file...')

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      const res = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (res.ok) {
        const message = `✓ ${result.message}\n\n${
          result.errors && result.errors.length > 0
            ? `Errors:\n${result.errors.join('\n')}`
            : ''
        }`
        
        setUploadProgress(message)
        
        if (result.successful > 0) {
          setTimeout(() => {
            setOpen(false)
            setCsvFile(null)
            setUploadProgress('')
            router.refresh()
          }, 3000)
        }
      } else {
        const errorMessage = result.error || 'Failed to upload CSV'
        const details = result.details ? `\n\nDetails: ${JSON.stringify(result.details, null, 2)}` : ''
        const errorList = result.errors && result.errors.length > 0 
          ? `\n\nErrors:\n${result.errors.join('\n')}` 
          : ''
        
        alert(`${errorMessage}${details}${errorList}`)
        setUploadProgress('')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Network error: Failed to upload CSV file. Please check your connection and try again.')
      setUploadProgress('')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `admission_number,name_with_initial,full_name,date_of_birth,nic_number,date_of_admission,father_name,father_status,madrasa_grade,usthadh_name,usthadh_contact_number,school_grade,section,district,address,contact_number
ADM2026001,M.A. Hassan,Mohamed Ali Hassan,2010-05-15,200512345678,2026-01-10,Ali Hassan,YES,Grade 5,Usthadh Ahmed,0771234567,Grade 6,A,Colombo,"123 Main Street, Colombo",0779876543
ADM2026002,F.R. Zainab,Fathima Rizana Zainab,2011-08-20,,2026-01-10,Rahman Ali,YES,Grade 4,Usthadh Ahmed,0771234567,Grade 5,A,Gampaha,"456 Temple Road, Gampaha",0778765432`

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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Student
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Student</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setUploadMode('form')}
            className={`px-4 py-2 font-medium transition-colors ${
              uploadMode === 'form'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single Entry
          </button>
          <button
            onClick={() => setUploadMode('csv')}
            className={`px-4 py-2 font-medium transition-colors ${
              uploadMode === 'csv'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bulk Upload (CSV)
          </button>
        </div>

        {uploadMode === 'csv' ? (
          <form onSubmit={handleCsvUpload} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format Instructions</h3>
              <p className="text-sm text-blue-800 mb-3">
                The CSV file must contain the following columns in this exact order:
              </p>
              <div className="bg-white rounded p-3 text-xs font-mono overflow-x-auto">
                <div className="text-gray-600 mb-2">Required columns:</div>
                <div className="text-blue-600">
                  admission_number, name_with_initial, full_name, date_of_birth, nic_number,
                  date_of_admission, father_name, father_status, madrasa_grade, usthadh_name,
                  usthadh_contact_number, school_grade, section, district, address, contact_number
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-blue-800">
                <p>• <strong>Required fields:</strong> admission_number, name_with_initial, full_name, date_of_birth, date_of_admission, father_name, madrasa_grade</p>
                <p>• <strong>Date format:</strong> YYYY-MM-DD (e.g., 2010-05-15)</p>
                <p>• <strong>father_status:</strong> YES (Alive) or NO (Deceased)</p>
                <p>• <strong>madrasa_grade</strong> must match existing class names in the system</p>
                <p>• <strong>section</strong> must be one of: A, B, C, D (if provided)</p>
                <p>• Enclose fields with commas in quotes (e.g., "123 Main St, Colombo")</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="mt-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setCsvFile(file)
                    setUploadProgress('')
                  }
                }}
                className="hidden"
              />
              
              {csvFile ? (
                <div className="space-y-3 m-4">
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{csvFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCsvFile(null)
                      setUploadProgress('')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className='mt-4'>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select CSV File
                    </Button>
                  </div>
                  <p className="text-sm mb-4 text-gray-500">or drag and drop your CSV file here</p>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
                {uploadProgress}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || !csvFile} className="flex-1">
                {loading ? 'Uploading...' : 'Upload Students'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
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
                    placeholder="e.g., ADM2026001"
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Student'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}