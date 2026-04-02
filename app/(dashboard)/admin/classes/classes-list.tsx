'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditClassDialog } from './edit-class-dialog'

type ClassWithDepartment = {
  id: string
  name: string
  department_id: string
  default_strength: number
  is_active: boolean
  created_at: string
  departments: {
    id: string
    name: string
    type: string
  } | null
  student_enrollments: { count: number | string }[]
}

type Department = {
  id: string
  name: string
  type: string
}

export function ClassesList({
  classes,
  departments,
}: {
  classes: ClassWithDepartment[]
  departments: Department[]
}) {
  const router = useRouter()
  const [editingClass, setEditingClass] = useState<ClassWithDepartment | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete class')
    }
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No classes found. Create your first class!</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Class Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Enrolled / Capacity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((classItem) => {
              const enrolled = Number(classItem.student_enrollments?.[0]?.count ?? 0)
              const isFull = enrolled >= classItem.default_strength
              const dept = classItem.departments
              return (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{classItem.name}</td>
                  <td className="px-4 py-3">
                    {dept ? (
                      <div>
                        <p className="text-sm text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{dept.type}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No department</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className={isFull ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {enrolled}
                      </span>
                      <span className="text-gray-400">/ {classItem.default_strength}</span>
                      {isFull && (
                        <Badge className="ml-1 text-xs py-0 bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                          Full
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={
                        classItem.is_active
                          ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }
                    >
                      {classItem.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(classItem.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingClass(classItem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(classItem.id, classItem.name)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingClass && (
        <EditClassDialog
          classItem={editingClass}
          departments={departments}
          onClose={() => setEditingClass(null)}
        />
      )}
    </>
  )
}