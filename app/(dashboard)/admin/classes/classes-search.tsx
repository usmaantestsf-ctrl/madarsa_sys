'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
  id: string
  name: string
  departments: {
    name: string
    type: string
  }
}

export function ClassesSearch({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchClasses = async () => {
      if (!search.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          departments (name, type)
        `)
        .ilike('name', `%${search}%`)
        .limit(5)

      setResults((data as any) || [])
      setShowDropdown(true)
      setLoading(false)
    }

    const debounce = setTimeout(searchClasses, 300)
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
      router.push(`/admin/classes?search=${encodeURIComponent(search.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleSelectResult = (classItem: SearchResult) => {
    setSearch(classItem.name)
    router.push(`/admin/classes?search=${encodeURIComponent(classItem.name)}`)
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSearch('')
    setResults([])
    setShowDropdown(false)
    router.push('/admin/classes')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by class name..."
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
              {results.map((classItem) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => handleSelectResult(classItem)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                >
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{classItem.name}</p>
                    <p className="text-sm text-gray-600">
                      {classItem.departments.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {classItem.departments.type}
                    </p>
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
