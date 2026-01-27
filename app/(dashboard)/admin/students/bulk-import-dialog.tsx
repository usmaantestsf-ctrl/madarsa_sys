'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, X, Download, CheckCircle, XCircle } from 'lucide-react'

type ImportResult = {
  success: number
  failed: number
  errors: Array<{ row: number; error: string; data: any }>
}

export function BulkImportDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResult(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        if (data.success > 0) {
          router.refresh()
        }
      } else {
        alert(data.error || 'Import failed')
      }
    } catch (error) {
      alert('Import failed. Please try again.')
    }

    setLoading(false)
  }

  const downloadTemplate = () => {
    const csvContent = `name,admission_number,nic,phone,address,class_name,guardian_name,guardian_phone,guardian_nic
Ahmed Ali,2026001,200512345678,0771234567,123 Main St,Grade 1A,Mohamed Ali,0779876543,198012345678
Fatima Hassan,2026002,200612345679,0772234567,456 Oak Ave,Grade 1A,Hassan Ibrahim,0778876543,197512345678`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Bulk Import
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bulk Import Students</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Download the CSV template below</li>
            <li>Fill in student details (one student per row)</li>
            <li>Make sure class names match existing classes exactly</li>
            <li>Upload the completed CSV file</li>
          </ol>
        </div>

        {/* Download Template */}
        <Button onClick={downloadTemplate} variant="outline" className="w-full mb-4">
          <Download className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : 'Click to upload CSV file'}
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
          </label>
        </div>

        {/* Import Results */}
        {result && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">{result.success} successful</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">{result.failed} failed</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                <div className="space-y-2">
                  {result.errors.map((error, idx) => (
                    <div key={idx} className="text-sm text-red-800">
                      <span className="font-medium">Row {error.row}:</span> {error.error}
                      <div className="text-xs text-red-600 ml-4">
                        {JSON.stringify(error.data)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1"
          >
            {loading ? 'Importing...' : 'Import Students'}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
