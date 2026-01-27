import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimetableGrid } from './timetable-grid'
import { AddTimetableDialog } from './add-timetable-dialog'

async function getTimetableData() {
  const supabase = await createClient()
  
  const { data: timetable } = await supabase
    .from('timetable')
    .select(`
      *,
      classes (id, name),
      subjects (id, name),
      lecturers (id, name),
      time_slots (id, slot_number, start_time, end_time)
    `)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('day_of_week')

  return timetable || []
}

async function getFormData() {
  const supabase = await createClient()
  
  const [classes, subjects, lecturers, timeSlots] = await Promise.all([
    supabase.from('classes').select('id, name').eq('is_active', true).order('name'),
    supabase.from('subjects').select('id, name').order('name'),
    supabase.from('lecturers').select('id, name').eq('is_active', true).order('name'),
    supabase.from('time_slots').select('*').order('slot_number'),
  ])

  // Add console logging to see what we're getting
  console.log('📊 Form Data:', {
    classes: classes.data?.length,
    subjects: subjects.data?.length,
    lecturers: lecturers.data?.length,
    timeSlots: timeSlots.data?.length,
  })

  console.log('⏰ Time Slots:', timeSlots.data)

  return {
    classes: classes.data || [],
    subjects: subjects.data || [],
    lecturers: lecturers.data || [],
    timeSlots: timeSlots.data || [],
  }
}

export default async function TimetablePage() {
  const [timetable, formData] = await Promise.all([
    getTimetableData(),
    getFormData()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 mt-1">Manage weekly class schedule</p>
        </div>
        <AddTimetableDialog {...formData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableGrid timetable={timetable as any} timeSlots={formData.timeSlots} />
        </CardContent>
      </Card>
    </div>
  )
}
