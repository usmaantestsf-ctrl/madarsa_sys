'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AddTimetableDialog } from './add-timetable-dialog'

type Department = { id: string; name: string; type: string }
type Class = { id: string; name: string; department_id: string }

const daysOfWeek = [
  { value: '0', label: 'Monday' },
  { value: '1', label: 'Tuesday' },
  { value: '2', label: 'Wednesday' },
  { value: '3', label: 'Thursday' },
  { value: '4', label: 'Friday' },
  { value: '5', label: 'Saturday' },
  { value: '6', label: 'Sunday' },
]

export function TimetableSelector({
  departments,
  classes,
  selectedDepartment,
  selectedClass,
  selectedDay,
}: {
  departments: Department[]
  classes: Class[]
  selectedDepartment?: string
  selectedClass?: string
  selectedDay?: string  // ← new
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [departmentId, setDepartmentId] = useState(selectedDepartment || '')
  const [classId, setClassId] = useState(selectedClass || '')
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay || '')
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])

  useEffect(() => {
    if (departmentId) {
      const filtered = classes.filter((c) => c.department_id === departmentId)
      setFilteredClasses(filtered)
      if (classId && !filtered.some((c) => c.id === classId)) {
        setClassId('')
      }
    } else {
      setFilteredClasses([])
      setClassId('')
    }
  }, [departmentId, classes])

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams)

    if (departmentId) params.set('department', departmentId)
    else params.delete('department')

    if (classId) params.set('class', classId)
    else params.delete('class')

    if (dayOfWeek !== '') params.set('day', dayOfWeek)
    else params.delete('day')

    router.push(`/admin/timetable?${params.toString()}`)
  }

  const canView = !!(departmentId && classId)
  const canAdd = !!(departmentId && classId && dayOfWeek !== '')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.type})
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            disabled={!departmentId}
          >
            <option value="">
              {departmentId ? 'Select class' : 'Select department first'}
            </option>
            {filteredClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Day of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Day of Week
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            disabled={!classId}
          >
            <option value="">All days</option>
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <Button
            onClick={handleFilter}
            className="flex-1"
            disabled={!canView}
          >
            View Timetable
          </Button>
          {canAdd && (
            <AddTimetableDialog
              classId={classId}
              departmentId={departmentId}
              dayOfWeek={parseInt(dayOfWeek)}  // ← new
            />
          )}
        </div>
      </div>
      {canView && !dayOfWeek && (
        <p className="mt-2 text-xs text-amber-600">
          💡 Select a day to enable adding entries and manage time slots for that day.
        </p>
      )}
    </div>
  )
}