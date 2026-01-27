'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditStudentDialog } from './edit-student-dialog'

type StudentWithClass = {
  id: string
  name: string
  nic: string | null
  phone: string | null
  address: string | null
  admission_number: string
  guardian_name: string
  guardian_phone: string
  guardian_nic: string | null
  is_active: boolean
  created_at: string
  class_id: string
  classes: {
    id: string
    name: string
    department_id: string
    departments: {
      id: string
      name: string
    }
  }
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Guardian</th>
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
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    {student.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.classes.departments.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.classes.name}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {student.guardian_name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {student.guardian_phone}
                    </p>
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
