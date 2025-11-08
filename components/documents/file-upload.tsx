'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FileUploadProps {
  onUploadSuccess?: () => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    setError('')
    setSuccess('')

    // Validate file count
    if (files.length > 10) {
      setError('Maximum 10 files allowed at once')
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
          setError(`Invalid file type: ${file.name}. Allowed: JPG, PNG, PDF`)
          continue
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum 10MB`)
          continue
        }

        // Upload file
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || `Failed to upload ${file.name}`)
        } else {
          setSuccess(`Successfully uploaded ${file.name}`)
        }
      }

      // Refresh parent component
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragging ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">or</p>
            </div>
            <div>
              <label htmlFor="file-upload">
                <Button type="button" disabled={uploading} asChild>
                  <span>
                    {uploading ? 'Uploading...' : 'Browse Files'}
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG (max 10MB, up to 10 files)
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-md dark:bg-green-950 dark:text-green-300">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
