'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraduationCap, X, AlertTriangle, CheckCircle } from 'lucide-react'

type Props = {
  currentYear: string
  totalActive: number
}

type PromoteResult = {
  total:     number
  promoted:  number
  passedOut: number
  skipped:   number
  failed:    number
  errors:    string[]
}

export function PromoteStudentsDialog({ currentYear, totalActive }: Props) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [newYear, setNewYear] = useState('')
  const [result,  setResult]  = useState<PromoteResult | null>(null)
  const router = useRouter()

  const handlePromote = async () => {
    if (!newYear.trim()) {
      alert('Please enter the new academic year')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // ✅ calls /api/students/promote directly — no batch route needed
      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAcademicYear: newYear.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Promotion failed')
        return
      }

      setResult(data.result)
      router.refresh()
    } catch (err) {
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setResult(null)
    setNewYear('')
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-green-300 text-green-700 hover:bg-green-50"
      >
        <GraduationCap className="w-4 h-4 mr-2" />
        Promote Students ({totalActive})
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">Promote All Students</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {result ? (
                // ── Result view ──
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Promotion Complete</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{result.promoted}</p>
                      <p className="text-xs text-gray-500">Promoted</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{result.passedOut}</p>
                      <p className="text-xs text-gray-500">Passed Out</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                      <p className="text-xs text-gray-500">Skipped</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center col-span-2">
                      <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>

                  {result.skipped > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                      ⚠️ {result.skipped} student(s) skipped — their department has no
                      class progression map configured.
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.map((e, i) => <p key={i}>• {e}</p>)}
                    </div>
                  )}

                  <Button onClick={handleClose} className="w-full">Done</Button>
                </div>

              ) : (
                // ── Confirm view ──
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">
                        Promoting eligible students from {totalActive} active:
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• Only departments with a progression map will be promoted</li>
                        <li>• Next class exists → promoted to that class</li>
                        <li>• Final class (no next) → marked as passed out</li>
                        <li>• No progression map → skipped, unchanged</li>
                        <li>
                          • Current year{' '}
                          <span className="font-mono font-bold">{currentYear || '—'}</span>{' '}
                          enrollments will be closed
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Academic Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newYear}
                      onChange={e => setNewYear(e.target.value)}
                      placeholder="e.g., 2026 or Ramadan 1447"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      New enrollments will be created under this year
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handlePromote}
                      disabled={loading || !newYear.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? 'Promoting...' : `Promote Students`}
                    </Button>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
