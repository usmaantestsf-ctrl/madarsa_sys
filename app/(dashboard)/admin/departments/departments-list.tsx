'use client'

import { useState } from 'react'
import { Department } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditDepartmentDialog } from './edit-department-dialog'

export function DepartmentsList({ departments }: { departments: Department[] }) {
  const router = useRouter()
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return

    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
    
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete department')
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{dept.type}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={dept.is_active ? 'success' : 'secondary'}>
                    {dept.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(dept.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingDepartment(dept)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(dept.id)}
                    disabled
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingDepartment && (
        <EditDepartmentDialog
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
        />
      )}
    </>
  )
}
