'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Class = {
  id: string
  name: string
  departments: { name: string }
}

type Lesson = {
  id: string
  time_slots: { slot_number: number; start_time: string; end_time: string }
  subjects: { name: string }
  lecturers: { name: string }
}

export function AttendanceSelector({
  classes,
  timetable,
  selectedClass,
  selectedLesson,
}: {
  classes: Class[]
  timetable: Lesson[]
  selectedClass?: string
  selectedLesson?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClassChange = (classId: string) => {
    const params = new URLSearchParams(searchParams)
    if (classId) {
      params.set('class', classId)
      params.delete('lesson') // Reset lesson when class changes
    } else {
      params.delete('class')
      params.delete('lesson')
    }
    router.push(`/admin/attendance?${params.toString()}`)
  }

  const handleLessonChange = (lessonId: string) => {
    const params = new URLSearchParams(searchParams)
    if (lessonId) {
      params.set('lesson', lessonId)
    } else {
      params.delete('lesson')
    }
    router.push(`/admin/attendance?${params.toString()}`)
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">📅 {today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.departments.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && timetable.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lesson
            </label>
            <select
              value={selectedLesson || ''}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Choose a lesson...</option>
              {timetable.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  Slot {lesson.time_slots.slot_number}: {lesson.subjects.name} - {lesson.lecturers.name} ({lesson.time_slots.start_time} - {lesson.time_slots.end_time})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedClass && timetable.length === 0 && (
          <div>
            <p className="text-sm text-gray-500 italic">No lessons scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  )
}
