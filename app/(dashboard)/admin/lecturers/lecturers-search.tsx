'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, UserCircle, Award, Languages } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
  lecturer_id: number
  full_name: string
  name_with_initial: string | null
  nic_no: string | null
  mobile: string | null
  admission_no: string | null
  qualifications?: { degree_name: string }[]
  languages?: { language_name: string }[]
}

export function LecturersSearch({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchLecturers = async () => {
      if (!search.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('lecturer')
        .select(`
          lecturer_id,
          full_name,
          name_with_initial,
          nic_no,
          mobile,
          admission_no,
          qualifications:lecturer_qualification(degree_name),
          languages:lecturer_language(language_name)
        `)
        .or(`full_name.ilike.%${search}%,nic_no.ilike.%${search}%,admission_no.ilike.%${search}%,mobile.ilike.%${search}%`)
        .limit(5)

      setResults(data || [])
      setShowDropdown(true)
      setLoading(false)
    }

    const debounce = setTimeout(searchLecturers, 300)
    return () => clearTimeout(debounce)
  }, [search])

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
      router.push(`/admin/lecturers?search=${encodeURIComponent(search.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleSelectResult = (lecturer: SearchResult) => {
    setSearch(lecturer.full_name)
    router.push(`/admin/lecturers?search=${encodeURIComponent(lecturer.nic_no || lecturer.full_name)}`)
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSearch('')
    setResults([])
    setShowDropdown(false)
    router.push('/admin/lecturers')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, NIC, admission no, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            className="pl-10"
            autoComplete="off"
          />
          
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 border-b">
                Top {results.length} results
              </div>
              {results.map((lecturer) => (
                <button
                  key={lecturer.lecturer_id}
                  type="button"
                  onClick={() => handleSelectResult(lecturer)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                >
                  <UserCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{lecturer.full_name}</p>
                    {lecturer.name_with_initial && (
                      <p className="text-xs text-gray-500">{lecturer.name_with_initial}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      {lecturer.nic_no && <span>NIC: {lecturer.nic_no}</span>}
                      {lecturer.admission_no && <span>Adm: {lecturer.admission_no}</span>}
                    </div>
                    {lecturer.mobile && (
                      <p className="text-xs text-gray-500 mt-0.5">{lecturer.mobile}</p>
                    )}
                    {/* Show qualifications and languages count */}
                    <div className="flex items-center gap-3 mt-1">
                      {lecturer.qualifications && lecturer.qualifications.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Award className="h-3 w-3" />
                          {lecturer.qualifications.length}
                        </span>
                      )}
                      {lecturer.languages && lecturer.languages.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Languages className="h-3 w-3" />
                          {lecturer.languages.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <Button type="submit">Search</Button>
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