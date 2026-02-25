// app/(dashboard)/admin/students/students-filter-panel.tsx
'use client'

import { useState, useMemo } from 'react'
import { AddStudentDialog } from './add-student-dialog'
import { StudentsSearch } from './students-search'
import { StudentsList } from './students-list'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Department = {
  id: string
  name: string
  type: string
}

type Student = {
  id: string
  admission_number: string
  name_with_initial: string
  full_name: string
  date_of_birth: string
  nic_number: string | null
  date_of_admission: string
  father_name: string
  father_status: string | null
  madrasa_grade: string
  department_id: string | null
  department: string | null
  usthadh_name: string | null
  usthadh_contact_number: string | null
  school_grade: string | null
  district: string | null
  address: string | null
  contact_number: string | null
  is_active: boolean
  is_passed: boolean
  departments?: { name: string; type: string }
}

type Props = {
  students: Student[]
  departments: Department[]
  searchQuery?: string
}

export function StudentsFilterPanel({ students, departments, searchQuery }: Props) {
  const [showFilters, setShowFilters] = useState(false)

  const [filterDepartment,   setFilterDepartment]   = useState('')
  const [filterSchoolGrade,  setFilterSchoolGrade]  = useState('')
  const [filterDistrict,     setFilterDistrict]     = useState('')
  const [filterStatus,       setFilterStatus]       = useState('')
  const [filterFatherStatus, setFilterFatherStatus] = useState('')
  const [filterAdmissionYear,setFilterAdmissionYear]= useState('')

  // ── Derive all filter options from real student data ──────────────────────

  const schoolGradeOptions = useMemo(() => {
    const grades = new Set<string>()
    students.forEach(s => { if (s.school_grade) grades.add(s.school_grade) })
    // Sort: "Grade 1", "Grade 2" ... numerically
    return Array.from(grades).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [students])

  const districtOptions = useMemo(() => {
    const districts = new Set<string>()
    students.forEach(s => { if (s.district) districts.add(s.district) })
    return Array.from(districts).sort()
  }, [students])

  const fatherStatusOptions = useMemo(() => {
    const statuses = new Set<string>()
    students.forEach(s => { if (s.father_status) statuses.add(s.father_status) })
    return Array.from(statuses).sort()
  }, [students])

  const admissionYearOptions = useMemo(() => {
    const years = new Set<string>()
    students.forEach(s => {
      if (s.date_of_admission) {
        years.add(new Date(s.date_of_admission).getFullYear().toString())
      }
    })
    return Array.from(years).sort((a, b) => Number(b) - Number(a)) // newest first
  }, [students])

  // ── Active filter count ───────────────────────────────────────────────────

  const activeFilterCount = [
    filterDepartment, filterSchoolGrade, filterDistrict,
    filterStatus, filterFatherStatus, filterAdmissionYear,
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilterDepartment('')
    setFilterSchoolGrade('')
    setFilterDistrict('')
    setFilterStatus('')
    setFilterFatherStatus('')
    setFilterAdmissionYear('')
  }

  // ── Apply filters ─────────────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterDepartment && s.department_id !== filterDepartment)
        return false

      if (filterSchoolGrade && s.school_grade !== filterSchoolGrade)
        return false

      if (filterDistrict && s.district !== filterDistrict)
        return false

      if (filterStatus) {
        if (filterStatus === 'active'   && !(s.is_active && !s.is_passed))  return false
        if (filterStatus === 'inactive' && !(!s.is_active && !s.is_passed)) return false
        if (filterStatus === 'passed'   && !s.is_passed)                    return false
      }

      if (filterFatherStatus && s.father_status !== filterFatherStatus)
        return false

      if (filterAdmissionYear && s.date_of_admission) {
        const year = new Date(s.date_of_admission).getFullYear().toString()
        if (year !== filterAdmissionYear) return false
      }

      return true
    })
  }, [students, filterDepartment, filterSchoolGrade, filterDistrict, filterStatus, filterFatherStatus, filterAdmissionYear])

  // ── KPIs reactive to filters ──────────────────────────────────────────────

  const kpis = useMemo(() => ({
    total:    filteredStudents.length,
    active:   filteredStudents.filter(s => s.is_active && !s.is_passed).length,
    inactive: filteredStudents.filter(s => !s.is_active && !s.is_passed).length,
    passed:   filteredStudents.filter(s => s.is_passed).length,
  }), [filteredStudents])

  return (
    <div className="space-y-4">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{kpis.active}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{kpis.inactive}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Passed Out</p>
          <p className="text-2xl font-bold text-blue-600">{kpis.passed}</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <StudentsSearch initialSearch={searchQuery} />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(v => !v)}
            className={activeFilterCount > 0 ? 'border-blue-400 text-blue-600' : ''}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          <AddStudentDialog />
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

          {/* Department — from departments table via prop */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* School Grade — from students.school_grade distinct values */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">School Grade</label>
            <select
              value={filterSchoolGrade}
              onChange={e => setFilterSchoolGrade(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {schoolGradeOptions.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* District — from students.district distinct values */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
            <select
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {districtOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="passed">Passed Out</option>
            </select>
          </div>

          {/* Father Status — from students.father_status distinct values */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Father Status</label>
            <select
              value={filterFatherStatus}
              onChange={e => setFilterFatherStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {fatherStatusOptions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Admission Year — from students.date_of_admission distinct years */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Admission Year</label>
            <select
              value={filterAdmissionYear}
              onChange={e => setFilterAdmissionYear(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {admissionYearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

        </div>
      )}

      {/* ── Results count ── */}
      {activeFilterCount > 0 && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredStudents.length}</span> of{' '}
          <span className="font-medium text-gray-900">{students.length}</span> students
        </p>
      )}

      {/* ── Table ── */}
      <StudentsList students={filteredStudents} />
    </div>
  )
}
