'use client'

import { useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { EditStudentDialog } from './edit-student-dialog'

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
  usthadh_name: string | null
  usthadh_contact_number: string | null
  school_grade: string | null
  department: string | null
  district: string | null
  address: string | null
  contact_number: string | null
  is_active: boolean
  is_passed: boolean
  departments?: {
    name: string
    type: string
  }
}

export function StudentsList({ students }: { students: Student[] }) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A'
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
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      window.location.reload()
    } else {
      alert('Failed to delete student')
    }
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No students found. Add your first student!</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department/Class
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Grade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Father
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.admission_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {student.name_with_initial}
                      {student.is_passed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Passed
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{student.full_name}</div>
                    {student.date_of_admission && (
                      <div className="text-xs text-gray-400">
                        Admitted: {formatDate(student.date_of_admission)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateAge(student.date_of_birth)} yrs
                    </div>
                    <div className="text-xs text-gray-500">
                      DOB: {formatDate(student.date_of_birth)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {student.departments?.name || student.madrasa_grade}
                    </div>
                    {student.departments?.type && (
                      <div className="text-xs text-gray-500 capitalize">
                        {student.departments.type}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {student.school_grade || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {student.father_name}
                      {student.father_status === 'Deceased' && (
                        <span className="ml-1 text-xs text-gray-500">(Deceased)</span>
                      )}
                    </div>
                    {student.usthadh_name && (
                      <div className="text-xs text-gray-500">
                        Usthadh: {student.usthadh_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {student.contact_number && (
                      <div className="text-sm text-gray-900">{student.contact_number}</div>
                    )}
                    {student.district && (
                      <div className="text-xs text-gray-500">{student.district}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {student.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : student.is_passed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Passed Out
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {viewingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Admission Number:</span>
                    <p className="font-medium">{viewingStudent.admission_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date of Admission:</span>
                    <p className="font-medium">{formatDate(viewingStudent.date_of_admission)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Name with Initial:</span>
                    <p className="font-medium">{viewingStudent.name_with_initial}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Full Name:</span>
                    <p className="font-medium">{viewingStudent.full_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date of Birth:</span>
                    <p className="font-medium">{formatDate(viewingStudent.date_of_birth)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <p className="font-medium">{calculateAge(viewingStudent.date_of_birth)} years</p>
                  </div>
                  <div>
                    <span className="text-gray-500">NIC Number:</span>
                    <p className="font-medium">{viewingStudent.nic_number || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Department/Class:</span>
                    <p className="font-medium">
                      {viewingStudent.departments?.name || viewingStudent.madrasa_grade}
                    </p>
                    {viewingStudent.departments?.type && (
                      <p className="text-xs text-gray-500 capitalize">
                        ({viewingStudent.departments.type})
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">School Grade:</span>
                    <p className="font-medium">{viewingStudent.school_grade || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Class Usthadh:</span>
                    <p className="font-medium">{viewingStudent.usthadh_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Usthadh Contact:</span>
                    <p className="font-medium">{viewingStudent.usthadh_contact_number || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Father Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Father Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Father Name:</span>
                    <p className="font-medium">{viewingStudent.father_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Father Status:</span>
                    <p className="font-medium">{viewingStudent.father_status || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Contact Number:</span>
                    <p className="font-medium">{viewingStudent.contact_number || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">District:</span>
                    <p className="font-medium">{viewingStudent.district || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Address:</span>
                    <p className="font-medium">{viewingStudent.address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                <div className="text-sm">
                  {viewingStudent.is_active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active Student
                    </span>
                  ) : viewingStudent.is_passed ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Passed Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4">
              <button
                onClick={() => setViewingStudent(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}