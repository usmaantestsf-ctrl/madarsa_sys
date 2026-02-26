'use client'

import { useState, useMemo } from 'react'
import { GraduationCap, Search, Eye, X, Users, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ── Types ─────────────────────────────────────────────────────────────────────

type PassedStudent = {
  id: string
  student_id: string
  admission_number: string
  full_name: string
  qualification: string
  passed_out_date: string
  remarks: string | null
  departments: { name: string } | null
  classes: { name: string } | null
  students: {
    name_with_initial: string | null
    date_of_birth: string | null
    contact_number: string | null
    district: string | null
  } | null
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: number
  color: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

// ── KPI color palette ─────────────────────────────────────────────────────────

const KPI_COLORS = [
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-cyan-500',
]

// ── Main Component ────────────────────────────────────────────────────────────

export function PassedStudentsList({
  passedStudents,
}: {
  passedStudents: PassedStudent[]
}) {
  const [search, setSearch]         = useState('')
  const [qualFilter, setQualFilter] = useState('all')
  const [viewing, setViewing]       = useState<PassedStudent | null>(null)

  // ── Derive unique qualifications from data (not hardcoded) ────────────────

  const qualOptions = useMemo(() => {
    return Array.from(
      new Set(passedStudents.map((s) => s.qualification).filter(Boolean))
    ).sort()
  }, [passedStudents])

  // ── Per-qualification KPI counts ──────────────────────────────────────────

  const qualKPIs = useMemo(() => {
    const map: Record<string, number> = {}
    passedStudents.forEach((s) => {
      map[s.qualification] = (map[s.qualification] || 0) + 1
    })
    return Object.entries(map)
      .map(([qualification, count]) => ({ qualification, count }))
      .sort((a, b) => b.count - a.count)
  }, [passedStudents])

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return passedStudents.filter((s) => {
      const matchesSearch =
        !search ||
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.admission_number.toLowerCase().includes(search.toLowerCase()) ||
        s.qualification.toLowerCase().includes(search.toLowerCase()) ||
        (s.departments?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchesQual =
        qualFilter === 'all' || s.qualification === qualFilter

      return matchesSearch && matchesQual
    })
  }, [passedStudents, search, qualFilter])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  const getPassedOutYear = (date: string) => new Date(date).getFullYear()

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── KPI Blocks ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {/* Total */}
        <KpiCard
          label="Total Passed Out"
          value={passedStudents.length}
          icon={Users}
          color="bg-blue-500"
        />
        {/* Per qualification — fully dynamic from DB */}
        {qualKPIs.map((kpi, idx) => (
          <KpiCard
            key={kpi.qualification}
            label={kpi.qualification}
            value={kpi.count}
            icon={Award}
            color={KPI_COLORS[idx % KPI_COLORS.length]}
          />
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search — unchanged from your original */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, admission no, qualification..."
            className="pl-9"
          />
        </div>

        {/* Qualification filter — plain native select, no shadcn needed */}
        <div className="relative">
          <select
            value={qualFilter}
            onChange={(e) => setQualFilter(e.target.value)}
            className="
              h-9 w-full sm:w-52 rounded-md border border-input
              bg-white px-3 py-1.5 text-sm text-gray-700
              shadow-sm outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-colors appearance-none pr-8
            "
          >
            <option value="all">All Qualifications</option>
            {qualOptions.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Clear filter button — only shows when filter is active */}
        {qualFilter !== 'all' && (
          <button
            onClick={() => setQualFilter('all')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors px-2"
          >
            <X className="w-3.5 h-3.5" />
            Clear filter
          </button>
        )}
      </div>

      {/* ── Result count hint ────────────────────────────────────────────────── */}
      {(search || qualFilter !== 'all') && (
        <p className="text-xs text-gray-400 mb-3">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
          <span className="font-semibold text-gray-600">{passedStudents.length}</span> students
        </p>
      )}

      {/* ── Table (your original — untouched) ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No passed students found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || qualFilter !== 'all'
              ? 'Try a different search term or filter'
              : 'Students marked as Passed Out will appear here'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Admission #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Final Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Qualification</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Passed Out Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {student.admission_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                    {student.students?.name_with_initial && (
                      <p className="text-xs text-gray-500">{student.students.name_with_initial}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.departments?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.classes?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎓 {student.qualification}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPassedOutYear(student.passed_out_date)}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(student.passed_out_date)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewing(student)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4 px-4">
            Showing {filtered.length} of {passedStudents.length} passed students
          </p>
        </div>
      )}

      {/* ── View Detail Modal (your original — untouched) ───────────────────── */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Passed Student Details</h2>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-gray-900">{viewing.full_name}</p>
                {viewing.students?.name_with_initial && (
                  <p className="text-sm text-gray-500">{viewing.students.name_with_initial}</p>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2">
                  🎓 {viewing.qualification}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Admission No</p>
                  <p className="font-medium text-gray-900">{viewing.admission_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Passed Out Date</p>
                  <p className="font-medium text-gray-900">{formatDate(viewing.passed_out_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{viewing.departments?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Final Class</p>
                  <p className="font-medium text-gray-900">{viewing.classes?.name || '—'}</p>
                </div>
                {viewing.students?.contact_number && (
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{viewing.students.contact_number}</p>
                  </div>
                )}
                {viewing.students?.district && (
                  <div>
                    <p className="text-xs text-gray-500">District</p>
                    <p className="font-medium text-gray-900">{viewing.students.district}</p>
                  </div>
                )}
              </div>
              {viewing.remarks && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{viewing.remarks}</p>
                </div>
              )}
              <button
                onClick={() => setViewing(null)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
