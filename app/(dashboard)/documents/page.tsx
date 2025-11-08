'use client'

import { useEffect, useState } from 'react'
import { FileUpload } from '@/components/documents/file-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Document } from '@/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDocuments()
  }, [page])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?page=${page}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data.documents)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDocuments()
      } else {
        alert('Failed to delete document')
      }
    } catch (error) {
      alert('Error deleting document')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      uploaded: 'secondary',
      processing: 'default',
      processed: 'default',
      failed: 'destructive',
      verified: 'default',
    }

    const colors: Record<string, string> = {
      uploaded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      processed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      verified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    }

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Upload and manage your documents
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <FileUpload onUploadSuccess={fetchDocuments} />
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-500">No documents uploaded yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Filename</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Uploaded</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">{doc.filename}</td>
                        <td className="p-3">
                          {doc.documentType ? (
                            <Badge variant="outline">{doc.documentType}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3">{getStatusBadge(doc.status)}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `/review?id=${doc.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
