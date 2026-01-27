'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type AttendanceRecord = {
  id: string
  student_id: string
  status: 'present' | 'absent' | 'late'
  date: string
  created_at: string
  students: {
    id: string
    name: string
    admission_number: string
  }
  lecturers: {
    name: string
  }
}

export function AttendanceList({ attendance }: { attendance: AttendanceRecord[] }) {
  if (attendance.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No attendance records found for this date</p>
      </div>
    )
  }

  const statusConfig = {
    present: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Present' },
    absent: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Absent' },
    late: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Late' },
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Admission #
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Student Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Marked By
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {attendance.map((record) => {
            const config = statusConfig[record.status]
            const Icon = config.icon

            return (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                  {record.students.admission_number}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {record.students.name}
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{record.lecturers.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(record.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
