import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCircle,
  Building2,
} from 'lucide-react'
import { HijriCalendar } from '../admin/calendar/hijri-calendar'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: departmentsCount },
    { count: classesCount },
    { count: subjectsCount },
    { count: lecturersCount },
    { count: studentsCount },
  ] = await Promise.all([
    supabase.from('departments').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('lecturer').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
  ])

  return {
    departments: departmentsCount || 0,
    classes:     classesCount     || 0,
    subjects:    subjectsCount    || 0,
    lecturers:   lecturersCount   || 0,
    students:    studentsCount    || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    { title: 'Total Students',  value: stats.students,    icon: Users,         color: 'bg-blue-500'   },
    { title: 'Total Classes',   value: stats.classes,     icon: GraduationCap, color: 'bg-green-500'  },
    { title: 'Total Lecturers', value: stats.lecturers,   icon: UserCircle,    color: 'bg-purple-500' },
    { title: 'Total Subjects',  value: stats.subjects,    icon: BookOpen,      color: 'bg-orange-500' },
    { title: 'Departments',     value: stats.departments, icon: Building2,     color: 'bg-pink-500'   },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Al Salah</h1>
        <p className="text-gray-500 mt-1">Overview Madrasa Managment System</p>
      </div>

      {/* KPI Cards — 2 cols mobile, 3 cols tablet, 5 cols laptop+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-1.5 rounded-lg flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Islamic Calendar ✅ */}
      <Card>
        <CardHeader>
          <CardTitle>Islamic Calendar</CardTitle>
          <p className="text-sm text-gray-500">
            Hijri (Arabic) calendar — based on Umm al-Qura calculations
          </p>
        </CardHeader>
        <CardContent>
          <HijriCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
