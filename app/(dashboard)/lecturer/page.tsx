import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, ClipboardCheck } from 'lucide-react'

async function getLecturerStats(lecturerId: string) {
  const supabase = await createClient()

  const jsDay = new Date().getDay()
  const today = jsDay === 0 ? 6 : jsDay - 1

  const { data: todayClasses } = await supabase
    .from('timetable')
    .select(`
      id,
      time_slots (slot_number, start_time, end_time),
      subjects (name),
      classes (name)
    `)
    .eq('lecturer_id', lecturerId)
    .eq('day_of_week', today)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('time_slots(slot_number)')

  const { count: weeklyClasses } = await supabase
    .from('timetable')
    .select('*', { count: 'exact', head: true })
    .eq('lecturer_id', lecturerId)
    .eq('is_active', true)
    .is('valid_to', null)

  return {
    todayClasses: todayClasses || [],
    weeklyClasses: weeklyClasses || 0,
  }
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
    .from('lecturer')
    .select('*')
    .eq('old_id', profile.lecturer_id)
    .single()

  return lecturer
}

export default async function LecturerDashboard() {
  const session = await getSession()

  if (!session || session.role !== 'lecturer') {
    redirect('/login')
  }

  const lecturer = await getLecturerInfo(session.userId)

  if (!lecturer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">No lecturer profile found. Please contact admin.</p>
      </div>
    )
  }

  const stats = await getLecturerStats(lecturer.old_id)  // ← fixed

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {lecturer.full_name}  {/* ← fixed */}
        </h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today&apos;s Classes
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.todayClasses.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Weekly Classes
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.weeklyClasses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Status
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayClasses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No classes scheduled for today
            </p>
          ) : (
            <div className="space-y-3">
              {stats.todayClasses.map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{cls.subjects.name}</p>
                    <p className="text-sm text-gray-600">{cls.classes.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Slot {cls.time_slots.slot_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cls.time_slots.start_time} - {cls.time_slots.end_time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}