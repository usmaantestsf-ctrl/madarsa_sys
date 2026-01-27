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

async function getLecturers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lecturers')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return data || []
}

async function getTimetable(classId?: string) {
  if (!classId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('timetable')
    .select(`
      *,
      subjects (
        id,
        name
      ),
      lecturers (
        id,
        name
      ),
      classes (
        id,
        name
      )
    `)
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time')

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

  const [departments, classes, subjects, lecturers, timetable] = await Promise.all([
    getDepartments(),
    getClasses(),
    getSubjects(),
    getLecturers(),
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
          <AddTimetableDialog
            classId={selectedClass}
            subjects={subjects}
            lecturers={lecturers}
          />
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
              lecturers={lecturers}
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
