'use client'

import { useState } from 'react'
import { GraduationCap, Search, Eye, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

type PassedStudent = {
  id: string
  student_id: string
  admission_number: string
  full_name: string
  qualification: string
  passed_out_date: string
  remarks: string | null
  departments: { name: string } | null
  classes: { name: string } | null
  students: {
    name_with_initial: string | null
    date_of_birth: string | null
    contact_number: string | null
    district: string | null
  } | null
}

export function PassedStudentsList({
  passedStudents,
}: {
  passedStudents: PassedStudent[]
}) {
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<PassedStudent | null>(null)

  const filtered = passedStudents.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase()) ||
    s.qualification.toLowerCase().includes(search.toLowerCase()) ||
    s.departments?.name?.toLowerCase().includes(search.toLowerCase()) || false
  )

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const getPassedOutYear = (date: string) => {
    return new Date(date).getFullYear()
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, admission no, qualification..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No passed students found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'Try a different search term' : 'Students marked as Passed Out will appear here'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Admission #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Final Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Qualification</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Passed Out Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {student.admission_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                    {student.students?.name_with_initial && (
                      <p className="text-xs text-gray-500">{student.students.name_with_initial}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.departments?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.classes?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎓 {student.qualification}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPassedOutYear(student.passed_out_date)}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(student.passed_out_date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewing(student)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4 px-4">
            Showing {filtered.length} of {passedStudents.length} passed students
          </p>
        </div>
      )}

      {/* ✅ View Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Passed Student Details</h2>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Header */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-gray-900">{viewing.full_name}</p>
                {viewing.students?.name_with_initial && (
                  <p className="text-sm text-gray-500">{viewing.students.name_with_initial}</p>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2">
                  🎓 {viewing.qualification}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Admission No</p>
                  <p className="font-medium text-gray-900">{viewing.admission_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Passed Out Date</p>
                  <p className="font-medium text-gray-900">{formatDate(viewing.passed_out_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{viewing.departments?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Final Class</p>
                  <p className="font-medium text-gray-900">{viewing.classes?.name || '—'}</p>
                </div>
                {viewing.students?.contact_number && (
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{viewing.students.contact_number}</p>
                  </div>
                )}
                {viewing.students?.district && (
                  <div>
                    <p className="text-xs text-gray-500">District</p>
                    <p className="font-medium text-gray-900">{viewing.students.district}</p>
                  </div>
                )}
              </div>

              {viewing.remarks && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{viewing.remarks}</p>
                </div>
              )}

              <button
                onClick={() => setViewing(null)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
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
