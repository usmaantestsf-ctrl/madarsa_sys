import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimetableSelector } from './timetable-selector'
import { TimetableGrid } from './timetable-grid'
import { AddTimetableDialog } from './add-timetable-dialog'

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

async function getSubjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name')
  return data || []
}

async function getTimetable(classId?: string) {
  if (!classId) return []
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable')
    .select(`
      *,
      subjects (
        id,
        name
      ),
      lecturers:lecturer_id (
        lecturer_id,
        full_name
      ),
      classes (
        id,
        name
      ),
      time_slots (
        id,
        slot_number,
        start_time,
        end_time
      )
    `)
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('day_of_week')
  
  console.log('Timetable data:', data) // Debug log
  console.log('Timetable error:', error) // Debug log
  
  return data || []
}

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; class?: string }>
}) {
  const params = await searchParams
  const selectedDepartment = params.department
  const selectedClass = params.class

  const [departments, classes, subjects, timetable] = await Promise.all([
    getDepartments(),
    getClasses(),
    getSubjects(),
    getTimetable(selectedClass),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-500 mt-1">Manage weekly class schedules</p>
        </div>
        {selectedClass && (
          <AddTimetableDialog classId={selectedClass} subjects={subjects} />
        )}
      </div>

      <TimetableSelector
        departments={departments}
        classes={classes}
        selectedDepartment={selectedDepartment}
        selectedClass={selectedClass}
      />

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <TimetableGrid
              timetable={timetable as any}
              subjects={subjects}
            />
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
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