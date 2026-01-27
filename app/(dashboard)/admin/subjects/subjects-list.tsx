'use client'

import { useState } from 'react'
import { Subject } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EditSubjectDialog } from './edit-subject-dialog'

export function SubjectsList({ subjects }: { subjects: Subject[] }) {
  const router = useRouter()
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
    
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete subject')
    }
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No subjects found. Create your first subject!</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Subject Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {subject.description || <span className="text-gray-400 italic">No description</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(subject.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingSubject(subject)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(subject.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSubject && (
        <EditSubjectDialog
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </>
  )
}
