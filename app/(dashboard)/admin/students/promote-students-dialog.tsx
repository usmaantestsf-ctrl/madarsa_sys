'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, ArrowUpCircle, AlertTriangle } from 'lucide-react'

export function PromoteStudentsDialog({
  currentYear,
  totalActive,
}: {
  currentYear: string
  totalActive: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [academicYear, setAcademicYear] = useState(currentYear)
  const [newAcademicYear, setNewAcademicYear] = useState('')
  const router = useRouter()

  const handlePromote = async () => {
    if (!academicYear || !newAcademicYear) {
      alert('Please fill both academic year fields.')
      return
    }

    if (academicYear === newAcademicYear) {
      alert('Current and new academic year cannot be the same.')
      return
    }

    if (!confirm(
      `⚠️ This will promote ALL ${totalActive} active students to the next grade.\n\nStudents in the final grade will be automatically marked as Passed Out.\n\nThis action cannot be undone. Are you sure?`
    )) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year: academicYear,
          new_academic_year: newAcademicYear,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        router.refresh()
      } else {
        alert(data.error || 'Promotion failed')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setResult(null)
    setNewAcademicYear('')
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        <ArrowUpCircle className="w-4 h-4 mr-2" />
        Promote Students
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Promote All Students</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Result view — after promotion */}
          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-700 mb-3">✅ Promotion Complete!</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Processed</span>
                    <span className="font-medium">{result.summary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promoted to Next Grade</span>
                    <span className="font-medium text-green-600">{result.summary.promoted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto Passed Out (Final Grade)</span>
                    <span className="font-medium text-blue-600">{result.summary.passedOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skipped (Inactive/Passed)</span>
                    <span className="font-medium text-gray-500">{result.summary.skipped}</span>
                  </div>
                  {result.summary.errors > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Errors</span>
                      <span className="font-medium text-red-600">{result.summary.errors}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Show errors if any */}
              {result.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">Errors:</p>
                  {result.errors.map((err: string, i: number) => (
                    <p key={i} className="text-xs text-red-600">{err}</p>
                  ))}
                </div>
              )}

              <Button onClick={handleClose} className="w-full">Done</Button>
            </div>

          ) : (
            // Promotion form
            <div className="space-y-4">

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div className="text-xs text-orange-700">
                  <p className="font-semibold mb-1">This will promote {totalActive} active students!</p>
                  <p>Students in their final grade will be automatically marked as <strong>Passed Out</strong>. This cannot be undone.</p>
                </div>
              </div>

              {/* Current Academic Year */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Current Academic Year
                </label>
                <Input
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  placeholder="e.g., 2026 or Ramadan 1447"
                />
                <p className="text-xs text-gray-400 mt-1">Students enrolled in this year will be promoted</p>
              </div>

              {/* New Academic Year */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  New Academic Year *
                </label>
                <Input
                  value={newAcademicYear}
                  onChange={e => setNewAcademicYear(e.target.value)}
                  placeholder="e.g., 2027 or Ramadan 1448"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">New enrollments will be created under this year</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handlePromote}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? 'Promoting...' : `Promote ${totalActive} Students`}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
