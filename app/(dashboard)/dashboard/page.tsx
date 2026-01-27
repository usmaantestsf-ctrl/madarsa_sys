import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

async function getTodayTimetable() {
  const supabase = await createClient()
  const today = new Date().getDay() // 0 = Sunday

  const { data, error } = await supabase
    .from('timetable')
    .select(`
      id,
      day_of_week,
      classes (id, name),
      subjects (id, name),
      lecturers (id, name),
      time_slots (slot_number, start_time, end_time)
    `)
    .eq('day_of_week', today)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('time_slots(slot_number)')
    .order('classes(name)')

  if (error) {
    console.error('Error loading timetable', error)
    return []
  }

  return data || []
}

export default async function DailyDashboardPage() {
  const timetable = await getTodayTimetable()
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Timetable</h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {timetable.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              No lessons scheduled for today.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Class
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Lecturer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timetable.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {entry.time_slots.start_time} - {entry.time_slots.end_time}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {entry.classes.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {entry.subjects.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {entry.lecturers.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
