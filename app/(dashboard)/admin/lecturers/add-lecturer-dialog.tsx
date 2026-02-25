'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Trash2, Eye, EyeOff } from 'lucide-react'

type QualificationInput = {
  degree_name: string
  year_completed: string
  degree_name_other?: string
  institute_name: string
}

type LanguageInput = {
  language_name: string
  language_name_other?: string
  proficiency_level: string
}

export function AddLecturerDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    admission_no: '',
    admission_date: '',
    full_name: '',
    name_with_initial: '',
    date_of_birth: '',
    nic_no: '',
    address: '',
    district: '',
    city: '',
    mobile: '',
    whatsapp: '',
    date_of_appointment: '',
    age_at_appointment: '',
    appointment_post: '',
    madrasa_name: '',
    madrasa_address: '',
    passed_out_year: '',
    certificate_no: '',
    other_skills: '',
    remarks: '',
    signature_name: '',
    // credentials
    email: '',
    password: '',
  })

  const [qualifications, setQualifications] = useState<QualificationInput[]>([
    { degree_name: '', year_completed: '', institute_name: '' }
  ])

  const [languages, setLanguages] = useState<LanguageInput[]>([
    { language_name: '', proficiency_level: '' }
  ])

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const validQualifications = qualifications.filter(q => q.degree_name.trim() !== '')
    const validLanguages = languages.filter(l => l.language_name.trim() !== '')

    const payload = {
      admission_no: formData.admission_no || null,
      admission_date: formData.admission_date || null,
      full_name: formData.full_name,
      name_with_initial: formData.name_with_initial || null,
      date_of_birth: formData.date_of_birth || null,
      nic_no: formData.nic_no || null,
      address: formData.address || null,
      district: formData.district || null,
      city: formData.city || null,
      mobile: formData.mobile || null,
      whatsapp: formData.whatsapp || null,
      date_of_appointment: formData.date_of_appointment || null,
      age_at_appointment: formData.age_at_appointment ? parseInt(formData.age_at_appointment) : null,
      appointment_post: formData.appointment_post || null,
      madrasa_name: formData.madrasa_name || null,
      madrasa_address: formData.madrasa_address || null,
      passed_out_year: formData.passed_out_year ? parseInt(formData.passed_out_year) : null,
      certificate_no: formData.certificate_no || null,
      other_skills: formData.other_skills || null,
      remarks: formData.remarks || null,
      signature_name: formData.signature_name || null,
      // credentials — send as-is, API will apply defaults if blank
      email: formData.email.trim() || null,
      password: formData.password.trim() || null,
      qualifications: validQualifications.map(q => ({
        degree_name: q.degree_name === 'Other' ? (q.degree_name_other || '') : q.degree_name,
        year_completed: q.year_completed ? parseInt(q.year_completed) : null,
        institute_name: q.institute_name || null,
      })),
      languages: validLanguages.map(l => ({
        language_name: l.language_name === 'Other' ? (l.language_name_other || '') : l.language_name,
        proficiency_level: l.proficiency_level || null,
      })),
    }

    const res = await fetch('/api/lecturers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      setOpen(false)
      resetForm()
      router.refresh()
      // Show the credentials that were used so admin can share them
      const usedEmail = formData.email.trim() || `lecturer_${data.lecturer_id}@madrasa.lk`
      const usedPassword = formData.password.trim() || 'Lecturer@123'
      alert(
        `Lecturer created successfully!\n\n` +
        `Login Credentials:\nEmail: ${usedEmail}\nPassword: ${usedPassword}\n\n` +
        `Please share these securely with the lecturer.`
      )
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to create lecturer')
    }

    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      admission_no: '',
      admission_date: '',
      full_name: '',
      name_with_initial: '',
      date_of_birth: '',
      nic_no: '',
      address: '',
      district: '',
      city: '',
      mobile: '',
      whatsapp: '',
      date_of_appointment: '',
      age_at_appointment: '',
      appointment_post: '',
      madrasa_name: '',
      madrasa_address: '',
      passed_out_year: '',
      certificate_no: '',
      other_skills: '',
      remarks: '',
      signature_name: '',
      email: '',
      password: '',
    })
    setQualifications([{ degree_name: '', year_completed: '', institute_name: '' }])
    setLanguages([{ language_name: '', proficiency_level: '' }])
    setShowPassword(false)
  }

  const addQualification = () => {
    setQualifications([...qualifications, { degree_name: '', year_completed: '', institute_name: '' }])
  }

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  const updateQualification = (index: number, field: keyof QualificationInput, value: string) => {
    const updated = [...qualifications]
    updated[index] = { ...updated[index], [field]: value }
    setQualifications(updated)
  }

  const addLanguage = () => {
    setLanguages([...languages, { language_name: '', proficiency_level: '' }])
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const updateLanguage = (index: number, field: keyof LanguageInput, value: string) => {
    const updated = [...languages]
    updated[index] = { ...updated[index], [field]: value }
    setLanguages(updated)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Lecturer
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b z-10">
          <h2 className="text-xl font-semibold">Add Lecturer</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Login Credentials ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Login Credentials</h3>
            <p className="text-xs text-gray-500">
              Leave blank to use defaults:{' '}
              <span className="font-mono bg-gray-100 px-1 rounded">lecturer_[id]@madrasa.lk</span>{' '}
              and password{' '}
              <span className="font-mono bg-gray-100 px-1 rounded">Lecturer@123</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., ahmed@madrasa.lk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank for default"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              <span>⚠️</span>
              <span>
                A login account will be automatically created. The credentials will be shown after successful creation — share them securely with the lecturer.
              </span>
            </div>
          </div>

          {/* ── Basic Information ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <Input
                  value={formData.admission_no}
                  onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                  placeholder="e.g., LEC2024001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <Input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., Ahmed Mohamed Ali"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name with Initial</label>
                <Input
                  value={formData.name_with_initial}
                  onChange={(e) => setFormData({ ...formData, name_with_initial: e.target.value })}
                  placeholder="e.g., A.M. Ali"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                <Input
                  value={formData.nic_no}
                  onChange={(e) => setFormData({ ...formData, nic_no: e.target.value })}
                  placeholder="e.g., 199012345678"
                />
              </div>
            </div>
          </div>

          {/* ── Contact Information ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g., 0771234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="e.g., 0771234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Dehiwala"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* ── Appointment Details ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Appointment</label>
                <Input
                  type="date"
                  value={formData.date_of_appointment}
                  onChange={(e) => setFormData({ ...formData, date_of_appointment: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age at Appointment</label>
                <Input
                  type="number"
                  value={formData.age_at_appointment}
                  onChange={(e) => setFormData({ ...formData, age_at_appointment: e.target.value })}
                  placeholder="e.g., 25"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Post</label>
                <Input
                  value={formData.appointment_post}
                  onChange={(e) => setFormData({ ...formData, appointment_post: e.target.value })}
                  placeholder="e.g., Senior Lecturer"
                />
              </div>
            </div>
          </div>

          {/* ── Madrasa Information ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Madrasa Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Madrasa Name</label>
                <Input
                  value={formData.madrasa_name}
                  onChange={(e) => setFormData({ ...formData, madrasa_name: e.target.value })}
                  placeholder="e.g., Jamia Madrasa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passed Out Year</label>
                <Input
                  type="number"
                  value={formData.passed_out_year}
                  onChange={(e) => setFormData({ ...formData, passed_out_year: e.target.value })}
                  placeholder="e.g., 2020"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Madrasa Address</label>
                <textarea
                  value={formData.madrasa_address}
                  onChange={(e) => setFormData({ ...formData, madrasa_address: e.target.value })}
                  placeholder="Madrasa full address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <Input
                  value={formData.certificate_no}
                  onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value })}
                  placeholder="e.g., CERT-2020-001"
                />
              </div>
            </div>
          </div>

          {/* ── Qualifications ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Qualifications</h3>
              <Button type="button" size="sm" variant="outline" onClick={addQualification}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {qualifications.map((qual, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Qualification #{index + 1}</span>
                  {qualifications.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeQualification(index)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree Name</label>
                    <select
                      value={
                        qual.degree_name === 'Other' || (qual.degree_name_other && qual.degree_name_other.length > 0)
                          ? 'Other'
                          : qual.degree_name
                      }
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          updateQualification(index, 'degree_name', 'Other')
                        } else {
                          const updated = [...qualifications]
                          updated[index] = { ...updated[index], degree_name: e.target.value, degree_name_other: undefined }
                          setQualifications(updated)
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select degree</option>
                      <option value="Dhawra Al-Hadhith">Dhawra Al-Hadhith</option>
                      <option value="Dhawra Al-Fiqh">Dhawra Al-Fiqh</option>
                      <option value="Dhawra Al-Thafseer">Dhawra Al-Thafseer</option>
                      <option value="Al-Iftha">Al-Iftha</option>
                      <option value="Al-Ijaza (Qur'an)">Al-Ijaza (Qur'an)</option>
                      <option value="Other">Other (Dip / B.A / M.A / Ph.D)</option>
                    </select>
                  </div>

                  {qual.degree_name === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specify Degree</label>
                      <Input
                        value={qual.degree_name_other || ''}
                        onChange={(e) => updateQualification(index, 'degree_name_other', e.target.value)}
                        placeholder="e.g., B.A in Islamic Studies"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <Input
                        type="number"
                        value={qual.year_completed}
                        onChange={(e) => updateQualification(index, 'year_completed', e.target.value)}
                        placeholder="e.g., 2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                      <Input
                        value={qual.institute_name}
                        onChange={(e) => updateQualification(index, 'institute_name', e.target.value)}
                        placeholder="e.g., Jamia Madrasa"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Languages ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              <Button type="button" size="sm" variant="outline" onClick={addLanguage}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {languages.map((lang, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Language #{index + 1}</span>
                  {languages.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeLanguage(index)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={
                        lang.language_name === 'Other' || (lang.language_name_other && lang.language_name_other.length > 0)
                          ? 'Other'
                          : lang.language_name
                      }
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          updateLanguage(index, 'language_name', 'Other')
                        } else {
                          const updated = [...languages]
                          updated[index] = { ...updated[index], language_name: e.target.value, language_name_other: undefined }
                          setLanguages(updated)
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select language</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Urdu">Urdu</option>
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Sinhala">Sinhala</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {lang.language_name === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specify Language</label>
                      <Input
                        value={lang.language_name_other || ''}
                        onChange={(e) => updateLanguage(index, 'language_name_other', e.target.value)}
                        placeholder="e.g., Malayalam, Hindi"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                    <select
                      value={lang.proficiency_level}
                      onChange={(e) => updateLanguage(index, 'proficiency_level', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Additional Information ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Skills</label>
                <textarea
                  value={formData.other_skills}
                  onChange={(e) => setFormData({ ...formData, other_skills: e.target.value })}
                  placeholder="List any other skills or certifications"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any additional notes or remarks"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Name</label>
                <Input
                  value={formData.signature_name}
                  onChange={(e) => setFormData({ ...formData, signature_name: e.target.value })}
                  placeholder="Name for official signatures"
                />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-2 pt-4 sticky bottom-0 bg-white border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Lecturer'}
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
