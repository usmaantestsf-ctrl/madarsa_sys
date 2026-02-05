'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, User, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
  id: string
  name_with_initial: string
  full_name: string
  admission_number: string
  nic_number: string | null
  date_of_birth: string
  madrasa_grade: string
  school_grade: string | null
  father_name: string
  district: string | null
}

export function StudentsSearch({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Search as user types with debounce
  useEffect(() => {
    const searchStudents = async () => {
      if (!search.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      // Search across multiple fields
      const { data } = await supabase
        .from('students')
        .select(`
          id,
          name_with_initial,
          full_name,
          admission_number,
          nic_number,
          date_of_birth,
          madrasa_grade,
          school_grade,
          father_name,
          district
        `)
        .or(`
          name_with_initial.ilike.%${search}%,
          full_name.ilike.%${search}%,
          admission_number.ilike.%${search}%,
          nic_number.ilike.%${search}%,
          father_name.ilike.%${search}%,
          district.ilike.%${search}%
        `)
        .eq('is_active', true)
        .order('name_with_initial')
        .limit(8)

      setResults((data as SearchResult[]) || [])
      setShowDropdown(true)
      setLoading(false)
    }

    const debounce = setTimeout(searchStudents, 300)
    return () => clearTimeout(debounce)
  }, [search])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/admin/students?search=${encodeURIComponent(search.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleSelectResult = (student: SearchResult) => {
    setSearch(student.name_with_initial)
    router.push(`/admin/students?search=${encodeURIComponent(student.admission_number)}`)
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSearch('')
    setResults([])
    setShowDropdown(false)
    router.push('/admin/students')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, admission #, NIC, father, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          
          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Dropdown Results */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                Found {results.length} student{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectResult(student)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{student.name_with_initial}</p>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {student.admission_number}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{student.full_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {calculateAge(student.date_of_birth)} yrs
                      </span>
                      <span>Grade: {student.madrasa_grade}</span>
                      {student.school_grade && <span>School: {student.school_grade}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Father: {student.father_name}</span>
                      {student.district && <span>• {student.district}</span>}
                      {student.nic_number && <span>• NIC: {student.nic_number}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showDropdown && !loading && search.trim() && results.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-4 text-center text-sm text-gray-500">
                No students found matching "{search}"
              </div>
            </div>
          )}
        </div>
        
        <Button type="submit" disabled={!search.trim()}>Search</Button>
        {search && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </form>
    </div>
  )
}