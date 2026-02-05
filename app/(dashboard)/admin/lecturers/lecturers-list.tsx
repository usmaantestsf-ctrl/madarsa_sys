'use client'

import { useState } from 'react'
import { Lecturer } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Phone, Award, Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditLecturerDialog } from './edit-lecturer-dialog'

export function LecturersList({ lecturers }: { lecturers: Lecturer[] }) {
  const router = useRouter()
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)

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
                      <p className="text-xs text-gray-500 mt-1">
                        {lecturer.name_with_initial}
                      </p>
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
                      <p className="text-xs text-gray-500">
                        WA: {lecturer.whatsapp}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {lecturer.qualifications && lecturer.qualifications.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {lecturer.qualifications.length}
                      </span>
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
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingLecturer(lecturer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(lecturer.lecturer_id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingLecturer && (
        <EditLecturerDialog
          lecturer={editingLecturer}
          onClose={() => setEditingLecturer(null)}
        />
      )}
    </>
  )
}