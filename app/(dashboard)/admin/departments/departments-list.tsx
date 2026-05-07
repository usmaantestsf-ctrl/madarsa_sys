'use client'

import { useState } from 'react'
import { Department } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditDepartmentDialog } from './edit-department-dialog'

// ✅ ADDED
type Lecturer = {
  lecturer_id: number
  visual_name: string | null
  full_name: string
}

export function DepartmentsList({
  departments,
  lecturers, // ✅ ADDED
}: {
  departments: Department[]
  lecturers: Lecturer[] // ✅ ADDED
}) {
  const router = useRouter()
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  // ✅ ADDED
  const getLecturerName = (id: number | null) => {
    if (!id) return null
    const l = lecturers.find(l => l.lecturer_id === id)
    return l ? (l.visual_name ?? l.full_name) : null
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete department')
    }
  }

  if (departments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No departments found. Create your first department!</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">In-Charge Teacher</th> {/* ✅ ADDED */}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((dept) => {
              // ✅ ADDED — cast to access new field
              const inchargeName = getLecturerName((dept as any).incharge_lecturer_id ?? null)
              return (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{dept.type}</td>
                  {/* ✅ ADDED column */}
                  <td className="px-4 py-3 text-sm">
                    {inchargeName ? (
                      <p className="text-gray-900">{inchargeName}</p>
                    ) : (
                      <p className="text-gray-400 italic">Not assigned</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={
                      dept.is_active
                        ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }>
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(dept.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingDepartment(dept)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingDepartment && (
        <EditDepartmentDialog
          department={editingDepartment as any}
          lecturers={lecturers} // ✅ ADDED
          onClose={() => setEditingDepartment(null)}
        />
      )}
    </>
  )
}