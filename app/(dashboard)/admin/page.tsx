import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCircle,
  Building2,
  Calendar
} from 'lucide-react'

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
    supabase.from('lecturers').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
  ])

  return {
    departments: departmentsCount || 0,
    classes: classesCount || 0,
    subjects: subjectsCount || 0,
    lecturers: lecturersCount || 0,
    students: studentsCount || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Classes',
      value: stats.classes,
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      title: 'Total Lecturers',
      value: stats.lecturers,
      icon: UserCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Subjects',
      value: stats.subjects,
      icon: BookOpen,
      color: 'bg-orange-500',
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: Building2,
      color: 'bg-pink-500',
    },
    {
      title: 'Active Timetables',
      value: 0,
      icon: Calendar,
      color: 'bg-cyan-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your Madrasa management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionButton href="/admin/students" label="Add Student" />
            <QuickActionButton href="/admin/lecturers" label="Add Lecturer" />
            <QuickActionButton href="/admin/classes" label="Manage Classes" />
            <QuickActionButton href="/admin/timetable" label="Edit Timetable" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No recent activity to display</p>
        </CardContent>
      </Card>
    </div>
  )
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {label}
    </a>
  )
}
