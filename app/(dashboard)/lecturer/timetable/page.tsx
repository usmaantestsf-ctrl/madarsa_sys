import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

async function getLecturerTimetable(lecturerId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('timetable')
    .select(`
      id,
      day_of_week,
      time_slots (slot_number, start_time, end_time),
      subjects (name),
      classes (name),
      lecturers (name)
    `)
    .eq('lecturer_id', lecturerId)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('day_of_week')
    .order('time_slots(slot_number)')

  return data || []
}

async function getLecturerInfo(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('users')
    .select('lecturer_id')
    .eq('id', userId)
    .single()

  if (!profile?.lecturer_id) return null

  const { data: lecturer } = await supabase
    .from('lecturers')
    .select('*')
    .eq('id', profile.lecturer_id)
    .single()

  return lecturer
}

export default async function LecturerTimetablePage() {
  const session = await getSession()
  
  if (!session || session.role !== 'lecturer') {
    redirect('/login')
  }

  const lecturer = await getLecturerInfo(session.userId)
  
  if (!lecturer) {
    return <div className="text-center py-12 text-red-600">No lecturer profile found</div>
  }

  const timetable = await getLecturerTimetable(lecturer.id)

  // Group by day
  const timetableByDay: Record<number, any[]> = {}
  timetable.forEach((entry: any) => {
    if (!timetableByDay[entry.day_of_week]) {
      timetableByDay[entry.day_of_week] = []
    }
    timetableByDay[entry.day_of_week].push(entry)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Weekly Timetable</h1>
        <p className="text-gray-500 mt-1">Your scheduled classes for the week</p>
      </div>

      {timetable.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {DAYS.map((day, dayIndex) => {
            const dayClasses = timetableByDay[dayIndex] || []
            
            if (dayClasses.length === 0) return null

            return (
              <Card key={dayIndex}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dayClasses.map((cls: any) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-primary-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-primary-900">{cls.subjects.name}</p>
                          <p className="text-sm text-gray-700 mt-1">{cls.classes.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Slot {cls.time_slots.slot_number}: {cls.time_slots.start_time} - {cls.time_slots.end_time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
