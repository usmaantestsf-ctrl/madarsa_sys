'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GraduationCap, X, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Building2 } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Department = {
  id: string
  name: string
  type: string
}

type Props = {
  currentYear: string
  totalActive: number
  departments: Department[]
}

type PromoteResult = {
  total:     number
  promoted:  number
  passedOut: number
  skipped:   number
  failed:    number
  errors:    string[]
}

// ── Islamic academic year options ──────────────────────────────────────────────
// Update this list each year by adding the next Ramadan year at the top
const ISLAMIC_YEAR_OPTIONS = [
  'Ramadan 1447',
  'Ramadan 1448',
  'Ramadan 1449',
  'Ramadan 1450',
]

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
          ${done   ? 'bg-green-500 text-white'
          : active ? 'bg-green-600 text-white ring-4 ring-green-100'
          :          'bg-gray-200 text-gray-400'}`}
      >
        {done ? '✓' : label}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PromoteStudentsDialog({ currentYear, totalActive, departments }: Props) {
  const [open,            setOpen]            = useState(false)
  const [step,            setStep]            = useState<1 | 2 | 3>(1)
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([])
  const [promoteAll,      setPromoteAll]      = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [newYear,         setNewYear]         = useState(ISLAMIC_YEAR_OPTIONS[0]) // ✅ default to nearest upcoming year
  const [result,          setResult]          = useState<PromoteResult | null>(null)
  const router = useRouter()

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toggleDept = (id: string) => {
    setSelectedDeptIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (promoteAll) {
      setPromoteAll(false)
      setSelectedDeptIds([])
    } else {
      setPromoteAll(true)
      setSelectedDeptIds([])
    }
  }

  const canProceedFromStep1 = promoteAll || selectedDeptIds.length > 0

  const selectedDeptNames = promoteAll
    ? 'All Departments'
    : departments
        .filter(d => selectedDeptIds.includes(d.id))
        .map(d => d.name)
        .join(', ')

  // ── Promote API call ────────────────────────────────────────────────────────

  const handlePromote = async () => {
    if (!newYear) { alert('Please select the new academic year'); return }

    setLoading(true)
    setResult(null)

    try {
      const body: Record<string, unknown> = { newAcademicYear: newYear }
      if (!promoteAll && selectedDeptIds.length > 0) {
        body.departmentIds = selectedDeptIds
      }

      const res  = await fetch('/api/students/promote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) { alert(data.error || 'Promotion failed'); return }

      setResult(data.result)
      setStep(3)
      router.refresh()
    } catch {
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ── Reset & close ───────────────────────────────────────────────────────────

  const handleClose = () => {
    setOpen(false)
    setStep(1)
    setResult(null)
    setNewYear(ISLAMIC_YEAR_OPTIONS[0])
    setSelectedDeptIds([])
    setPromoteAll(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900">Promote Students</h2>
                <div className="flex items-center gap-1.5">
                  <StepDot active={step === 1} done={step > 1} label="1" />
                  <div className={`w-6 h-0.5 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <StepDot active={step === 2} done={step > 2} label="2" />
                  <div className={`w-6 h-0.5 ${step > 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <StepDot active={step === 3} done={false}    label="3" />
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">

              {/* ── STEP 1 — Select Departments ──────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Which departments do you want to promote?
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Select one or more, or promote all at once.
                    </p>
                  </div>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors
                    ${promoteAll ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={promoteAll}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-800">All Departments</span>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{departments.length} depts</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex-1 h-px bg-gray-200" />
                    or choose specific
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {departments.map(dept => {
                      const checked = !promoteAll && selectedDeptIds.includes(dept.id)
                      return (
                        <label
                          key={dept.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors
                            ${promoteAll ? 'opacity-40 pointer-events-none border-gray-100'
                            : checked   ? 'border-green-400 bg-green-50'
                            :             'border-gray-200 hover:border-gray-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDept(dept.id)}
                            disabled={promoteAll}
                            className="w-4 h-4 accent-green-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{dept.name}</p>
                            {dept.type && (
                              <p className="text-xs text-gray-400 capitalize">{dept.type}</p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceedFromStep1}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* ── STEP 2 — Confirm & select year ───────────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-0.5">Promoting:</p>
                    <p className="text-xs">{selectedDeptNames}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">What will happen:</p>
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

                  {/* ✅ Dropdown instead of free text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promote to Academic Year <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ISLAMIC_YEAR_OPTIONS.map(year => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setNewYear(year)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left
                            ${newYear === year
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                          <span className="text-lg mr-1">🌙</span> {year}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      New enrollments will be created under this Ramadan year
                    </p>
                  </div>

                  {/* Confirm banner showing from → to */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Current year</p>
                      <p className="font-mono font-semibold text-gray-700">{currentYear || '—'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-500" />
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Promoting to</p>
                      <p className="font-mono font-semibold text-green-700">{newYear}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handlePromote}
                      disabled={loading || !newYear}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? 'Promoting...' : 'Promote Students'}
                    </Button>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 3 — Results ─────────────────────────────────────── */}
              {step === 3 && result && (
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
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
