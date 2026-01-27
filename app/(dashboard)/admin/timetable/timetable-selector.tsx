'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Department = {
  id: string
  name: string
  type: string
}

type Class = {
  id: string
  name: string
  department_id: string
}

export function TimetableSelector({
  departments,
  classes,
  selectedDepartment,
  selectedClass,
}: {
  departments: Department[]
  classes: Class[]
  selectedDepartment?: string
  selectedClass?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [departmentId, setDepartmentId] = useState(selectedDepartment || '')
  const [classId, setClassId] = useState(selectedClass || '')
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])

  // Filter classes when department changes
  useEffect(() => {
    if (departmentId) {
      const filtered = classes.filter((c) => c.department_id === departmentId)
      setFilteredClasses(filtered)

      // Reset class if it doesn't belong to new department
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

    router.push(`/admin/timetable?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Filter Button */}
        <div className="flex items-end">
          <Button onClick={handleFilter} className="w-full" disabled={!departmentId || !classId}>
            View Timetable
          </Button>
        </div>
      </div>
    </div>
  )
}
