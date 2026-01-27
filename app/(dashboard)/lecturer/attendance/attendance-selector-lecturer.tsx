'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Lesson = {
  id: string
  time_slots: { slot_number: number; start_time: string; end_time: string }
  subjects: { name: string }
  classes: { name: string }
}

export function AttendanceSelector({
  timetable,
  selectedLesson,
}: {
  timetable: Lesson[]
  selectedLesson?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLessonChange = (lessonId: string) => {
    const params = new URLSearchParams(searchParams)
    if (lessonId) {
      params.set('lesson', lessonId)
    } else {
      params.delete('lesson')
    }
    router.push(`/lecturer/attendance?${params.toString()}`)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">📅 {today}</p>
      </div>

      {timetable.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Lesson
          </label>
          <select
            value={selectedLesson || ''}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Choose a lesson...</option>
            {timetable.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                Slot {lesson.time_slots.slot_number}: {lesson.subjects.name} - {lesson.classes.name} ({lesson.time_slots.start_time} - {lesson.time_slots.end_time})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No lessons scheduled for today</p>
      )}
    </div>
  )
}
