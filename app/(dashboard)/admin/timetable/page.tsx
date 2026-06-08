import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimetableSelector } from './timetable-selector'
import { TimetableGrid } from './timetable-grid'

async function getDepartments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departments')
    .select('id, name, type')
    .eq('is_active', true)
    .order('name')
  return data || []
}

async function getClasses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('classes')
    .select('id, name, department_id')
    .eq('is_active', true)
    .order('name')
  return data || []
}

async function getTimetable(classId?: string, dayOfWeek?: string) {
  if (!classId) return []

  const supabase = await createClient()

  let query = supabase
    .from('timetable')
    .select(`
      *,
      subjects (id, name),
      lecturer:lecturer_id (lecturer_id, full_name),
      classes (id, name),
      time_slots (id, slot_number, start_time, end_time)
    `)
    .eq('class_id', classId)
    .eq('is_active', true)

  if (dayOfWeek !== undefined && dayOfWeek !== '') {
    query = query.eq('day_of_week', parseInt(dayOfWeek))
  }

  query = query.order('day_of_week')

  const { data, error } = await query
  if (error) console.error('Timetable error:', error.message)
  return data || []
}

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; class?: string; day?: string }>
}) {
  const params = await searchParams
  const selectedDepartment = params.department
  const selectedClass = params.class
  const selectedDay = params.day

  const [departments, classes, timetable] = await Promise.all([
    getDepartments(),
    getClasses(),
    getTimetable(selectedClass, selectedDay),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
        <p className="text-gray-500 mt-1">Manage weekly class schedules</p>
      </div>

      <TimetableSelector
        departments={departments}
        classes={classes}
        selectedDepartment={selectedDepartment}
        selectedClass={selectedClass}
        selectedDay={selectedDay}
      />

      {selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid
              timetable={timetable as any}
              departmentId={selectedDepartment || ''}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Please select a department and class to view timetable
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}