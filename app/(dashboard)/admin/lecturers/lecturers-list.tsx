'use client'

import { useState } from 'react'
import { Lecturer } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Phone, Award, Languages, Eye, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditLecturerDialog } from './edit-lecturer-dialog'

// ── Helper ──
const fmt = (val: string | null | undefined) => val || '—'
const fmtDate = (val: string | null | undefined) => {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function LecturersList({ lecturers }: { lecturers: Lecturer[] }) {
  const router = useRouter()
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)
  const [viewingLecturer, setViewingLecturer] = useState<Lecturer | null>(null)  // ← NEW

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecturer?')) return
    const res = await fetch(`/api/lecturers/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete lecturer')
    }
  }

  if (lecturers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No lecturers found. Add your first lecturer!</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Admission No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">NIC</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Qualifications</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Languages</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lecturers.map((lecturer) => (
              <tr key={lecturer.lecturer_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {lecturer.admission_no || '-'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lecturer.full_name}</p>
                    {lecturer.name_with_initial && (
                      <p className="text-xs text-gray-500 mt-1">{lecturer.name_with_initial}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{lecturer.nic_no || '-'}</td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {lecturer.mobile && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lecturer.mobile}
                      </p>
                    )}
                    {lecturer.whatsapp && lecturer.whatsapp !== lecturer.mobile && (
                      <p className="text-xs text-gray-500">WA: {lecturer.whatsapp}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {lecturer.qualifications && lecturer.qualifications.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-blue-600" />
                      <span className="text-sm text-gray-600">{lecturer.qualifications.length}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lecturer.languages && lecturer.languages.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Languages className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {lecturer.languages.map(l => l.language_name).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(lecturer.record_created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-end gap-2">
                  {/* ── NEW: View button ── */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingLecturer(lecturer)}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                  {/* ── Existing: Edit ── */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLecturer(lecturer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* ── Existing: Delete ── */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(lecturer.lecturer_id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Existing: Edit dialog ── */}
      {editingLecturer && (
        <EditLecturerDialog
          lecturer={editingLecturer}
          onClose={() => setEditingLecturer(null)}
        />
      )}

      {/* ── NEW: View modal ── */}
      {viewingLecturer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 border-b z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{viewingLecturer.full_name}</h2>
                {viewingLecturer.name_with_initial && (
                  <p className="text-sm text-gray-500">{viewingLecturer.name_with_initial}</p>
                )}
              </div>
              <button
                onClick={() => setViewingLecturer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">

              {/* ── Basic Information ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Admission No"    value={fmt(viewingLecturer.admission_no)} />
                  <Row label="Admission Date"  value={fmtDate(viewingLecturer.admission_date)} />
                  <Row label="Full Name"        value={fmt(viewingLecturer.full_name)} />
                  <Row label="Visual Name"      value={fmt((viewingLecturer as any).visual_name)} />
                  <Row label="Name with Initial" value={fmt(viewingLecturer.name_with_initial)} />
                  <Row label="Date of Birth"    value={fmtDate(viewingLecturer.date_of_birth)} />
                  <Row label="NIC Number"       value={fmt(viewingLecturer.nic_no)} />
                </div>
              </section>

              {/* ── Contact Information ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Mobile"    value={fmt(viewingLecturer.mobile)} />
                  <Row label="WhatsApp"  value={fmt(viewingLecturer.whatsapp)} />
                  <Row label="District"  value={fmt(viewingLecturer.district)} />
                  <Row label="City"      value={fmt(viewingLecturer.city)} />
                  <div className="col-span-2">
                    <Row label="Address" value={fmt(viewingLecturer.address)} />
                  </div>
                </div>
              </section>

              {/* ── Appointment Details ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Date of Appointment" value={fmtDate(viewingLecturer.date_of_appointment)} />
                  <Row label="Age at Appointment"  value={viewingLecturer.age_at_appointment ? String(viewingLecturer.age_at_appointment) : '—'} />
                  <div className="col-span-2">
                    <Row label="Appointment Post" value={fmt(viewingLecturer.appointment_post)} />
                  </div>
                </div>
              </section>

              {/* ── Madrasa Information ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Madrasa Information</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Madrasa Name"     value={fmt(viewingLecturer.madrasa_name)} />
                  <Row label="Passed Out Year"  value={viewingLecturer.passed_out_year ? String(viewingLecturer.passed_out_year) : '—'} />
                  <Row label="Certificate No"   value={fmt(viewingLecturer.certificate_no)} />
                  <div className="col-span-2">
                    <Row label="Madrasa Address" value={fmt(viewingLecturer.madrasa_address)} />
                  </div>
                </div>
              </section>

              {/* ── Qualifications ── */}
              {viewingLecturer.qualifications && viewingLecturer.qualifications.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Qualifications</h3>
                  <div className="space-y-2">
                    {viewingLecturer.qualifications.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Award className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{q.degree_name}</p>
                          <p className="text-xs text-gray-500">
                            {[q.year_completed, q.institute_name].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Languages ── */}
              {viewingLecturer.languages && viewingLecturer.languages.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingLecturer.languages.map((l, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-50 text-green-800 border border-green-200"
                      >
                        <Languages className="h-3 w-3" />
                        {l.language_name}
                        {l.proficiency_level && (
                          <span className="text-green-600 text-xs">· {l.proficiency_level}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Additional Information ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Additional Information</h3>
                <div className="space-y-3">
                  <Row label="Other Skills"   value={fmt(viewingLecturer.other_skills)} />
                  <Row label="Remarks"        value={fmt(viewingLecturer.remarks)} />
                  <Row label="Signature Name" value={fmt(viewingLecturer.signature_name)} />
                </div>
              </section>

              {/* ── Account ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Email" value={fmt((viewingLecturer as any).user?.email)} />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Status</span>
                    {(viewingLecturer as any).user?.is_active ? (
                      <Badge className="w-fit bg-green-100 text-green-800 border-green-200">Active</Badge>
                    ) : (
                      <Badge className="w-fit bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                    )}
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setViewingLecturer(null)}>
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

// ── Small helper component for label/value rows ──
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}