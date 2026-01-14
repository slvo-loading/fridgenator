'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/AuthContext'
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function Admin() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  })
  const [showResults, setShowResults] = useState(false)


    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard')
        }
    }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setShowResults(false)
    }
  }

  const processCSV = async () => {
    if (!file) return

    setProcessing(true)
    setShowResults(false)
    setResults({ success: 0, failed: 0, errors: [] })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload-ingredients', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Use Server-Sent Events to get real-time progress
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            if (data.type === 'progress') {
              setProgress({ current: data.current, total: data.total })
            } else if (data.type === 'complete') {
              setResults(data.results)
              setShowResults(true)
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing CSV:', err)
      setResults({
        success: 0,
        failed: 0,
        errors: [err instanceof Error ? err.message : 'Failed to process CSV']
      })
      setShowResults(true)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin</h1>
        <button onClick={() => router.push('/dashboard')}>back to dashboard</button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Ingredients CSV</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              CSV format: <code className="bg-gray-100 px-2 py-1 rounded">ingredient,description</code>
            </p>
            <p className="text-sm text-gray-500">
              Example: <code className="bg-gray-100 px-2 py-1 rounded">Tomato,A red fruit commonly used in cooking</code>
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose CSV file
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={processing}
              />
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          <button
            onClick={processCSV}
            disabled={!file || processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Processing... ({progress.current}/{progress.total})
              </>
            ) : (
              'Upload and Process'
            )}
          </button>
        </div>

        {showResults && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Success</span>
                </div>
                <p className="text-3xl font-bold text-green-900 mt-2">{results.success}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Failed</span>
                </div>
                <p className="text-3xl font-bold text-red-900 mt-2">{results.failed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Errors:</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {results.errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-800 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}