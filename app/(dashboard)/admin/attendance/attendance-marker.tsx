'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, LogOut, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Student = {
  id: string
  name: string
  admission_number: string
}

type AttendanceRecord = {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'left_early'
}

export function AttendanceMarker({
  students,
  timetableId,
}: {
  students: Student[]
  timetableId: string
}) {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'left_early'>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Load existing attendance for today
  useEffect(() => {
    loadExistingAttendance()
  }, [timetableId])

  const loadExistingAttendance = async () => {
    setLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('timetable_id', timetableId)
      .eq('date', today)

    if (data) {
      const attendanceMap: Record<string, any> = {}
      data.forEach((record: any) => {
        attendanceMap[record.student_id] = record.status
      })
      setAttendance(attendanceMap)
    }

    setLoading(false)
  }

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'left_early') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    // Get current user from session
    const userRes = await fetch('/api/auth/me')
    const userData = await userRes.json()
    
    if (!userData.user) {
      alert('You must be logged in to mark attendance')
      setSaving(false)
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timetable_id: timetableId,
        date: today,
        attendance: Object.entries(attendance).map(([student_id, status]) => ({
          student_id,
          status,
        })),
        marked_by: userData.user.userId,
      }),
    })

    if (res.ok) {
      alert('Attendance saved successfully!')
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to save attendance')
    }

    setSaving(false)
  }

  const markAllPresent = () => {
    const newAttendance: Record<string, 'present'> = {}
    students.forEach((student) => {
      newAttendance[student.id] = 'present'
    })
    setAttendance(newAttendance)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300'
      case 'absent': return 'bg-red-100 text-red-800 border-red-300'
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'left_early': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const summary = {
    present: Object.values(attendance).filter((s) => s === 'present').length,
    absent: Object.values(attendance).filter((s) => s === 'absent').length,
    late: Object.values(attendance).filter((s) => s === 'late').length,
    left_early: Object.values(attendance).filter((s) => s === 'left_early').length,
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading attendance...</div>
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex gap-4">
          <div className="text-sm">
            <span className="font-semibold text-green-600">{summary.present}</span> Present
          </div>
          <div className="text-sm">
            <span className="font-semibold text-red-600">{summary.absent}</span> Absent
          </div>
          <div className="text-sm">
            <span className="font-semibold text-yellow-600">{summary.late}</span> Late
          </div>
          <div className="text-sm">
            <span className="font-semibold text-orange-600">{summary.left_early}</span> Left Early
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={markAllPresent} variant="outline" size="sm">
            Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-2">
        {students.map((student) => (
          <div
            key={student.id}
            className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(attendance[student.id])}`}
          >
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-xs opacity-75">#{student.admission_number}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(student.id, 'present')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  attendance[student.id] === 'present'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleStatusChange(student.id, 'absent')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  attendance[student.id] === 'absent'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleStatusChange(student.id, 'late')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  attendance[student.id] === 'late'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleStatusChange(student.id, 'left_early')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  attendance[student.id] === 'left_early'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
