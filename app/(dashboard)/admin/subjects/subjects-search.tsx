'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
  id: string
  name: string
  description: string | null
}

export function SubjectsSearch({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchSubjects = async () => {
      if (!search.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('subjects')
        .select('id, name, description')
        .ilike('name', `%${search}%`)
        .limit(5)

      setResults(data || [])
      setShowDropdown(true)
      setLoading(false)
    }

    const debounce = setTimeout(searchSubjects, 300)
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
      router.push(`/admin/subjects?search=${encodeURIComponent(search.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleSelectResult = (subject: SearchResult) => {
    setSearch(subject.name)
    router.push(`/admin/subjects?search=${encodeURIComponent(subject.name)}`)
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSearch('')
    setResults([])
    setShowDropdown(false)
    router.push('/admin/subjects')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by subject name..."
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
              {results.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSelectResult(subject)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                >
                  <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    {subject.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {subject.description}
                      </p>
                    )}
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
