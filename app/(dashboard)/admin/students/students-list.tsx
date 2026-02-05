'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Phone, User, Calendar, Heart, HeartCrack } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditStudentDialog } from './edit-student-dialog'

type StudentWithClass = {
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
  created_at: string
}

export function StudentsList({ students }: { students: StudentWithClass[] }) {
  const router = useRouter()
  const [editingStudent, setEditingStudent] = useState<StudentWithClass | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete student')
    }
  }

  // Calculate age at runtime from date of birth
  const calculateAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No students found. Add your first student!</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Admission #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Madrasa Grade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">School Grade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Father</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                  {student.admission_number}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name_with_initial}</p>
                    <p className="text-xs text-gray-500">{student.full_name}</p>
                    {student.date_of_admission && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Admitted: {formatDate(student.date_of_admission)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {/* Age calculated at runtime */}
                  {calculateAge(student.date_of_birth)} yrs
                  <p className="text-xs text-gray-500">DOB: {formatDate(student.date_of_birth)}</p>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.madrasa_grade}</p>
                    {student.section && (
                      <p className="text-xs text-gray-500">Section: {student.section}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.school_grade || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {student.father_name}
                    </p>
                    {/* ADDED: Father Status Display */}
                    {student.father_status && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        {student.father_status === 'YES' ? (
                          <>
                            <Heart className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Alive</span>
                          </>
                        ) : (
                          <>
                            <HeartCrack className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">Deceased</span>
                          </>
                        )}
                      </p>
                    )}
                    {student.usthadh_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Usthadh: {student.usthadh_name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    {student.contact_number && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.contact_number}
                      </p>
                    )}
                    {student.usthadh_contact_number && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        U: {student.usthadh_contact_number}
                      </p>
                    )}
                    {student.district && (
                      <p className="text-xs text-gray-400 mt-1">{student.district}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={student.is_active ? 'success' : 'secondary'}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingStudent(student)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </>
  )
}