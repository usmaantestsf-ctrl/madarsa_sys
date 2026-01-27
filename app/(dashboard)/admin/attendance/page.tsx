import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceSelector } from './attendance-selector'
import { AttendanceMarker } from './attendance-marker'

async function getClasses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      departments (name)
    `)
    .eq('is_active', true)
    .order('name')

  return data || []
}

async function getTodayTimetable(classId?: string) {
  if (!classId) return []

  const supabase = await createClient()
  const today = new Date().getDay() // 0 = Sunday

  const { data } = await supabase
    .from('timetable')
    .select(`
      id,
      time_slots (id, slot_number, start_time, end_time),
      subjects (id, name),
      lecturers (id, name),
      classes (id, name)
    `)
    .eq('class_id', classId)
    .eq('day_of_week', today)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('time_slots(slot_number)')

  return data || []
}

async function getStudents(classId?: string) {
  if (!classId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('students')
    .select('id, name, admission_number')
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('admission_number')

  return data || []
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; lesson?: string }>
}) {
  // ✅ unwrap the promise from Next.js
  const params = await searchParams
  const selectedClass = params.class
  const selectedLesson = params.lesson

  const classes = await getClasses()
  const [timetable, students] = await Promise.all([
    getTodayTimetable(selectedClass),
    getStudents(selectedClass),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">
          Mark student attendance for today&apos;s lessons
        </p>
      </div>

      <AttendanceSelector
        classes={classes as any}
        timetable={timetable as any}
        selectedClass={selectedClass}
        selectedLesson={selectedLesson}
      />

      {selectedClass && selectedLesson && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceMarker
              students={students as any}
              timetableId={selectedLesson}
            />
          </CardContent>
        </Card>
      )}

      {selectedClass && !selectedLesson && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Select a lesson to mark attendance
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Select a class to view today&apos;s lessons
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
