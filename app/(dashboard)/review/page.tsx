'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const documentId = searchParams.get('id')

  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId)
    } else {
      fetchPendingDocuments()
    }
  }, [documentId])

  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`)
      const data = await response.json()
      if (data.success) {
        setDocument(data.data)
        initializeFormData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch document:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingDocuments = async () => {
    try {
      const response = await fetch('/api/documents?status=processed&limit=1')
      const data = await response.json()
      if (data.success && data.data.documents.length > 0) {
        const doc = data.data.documents[0]
        setDocument(doc)
        initializeFormData(doc)
      }
    } catch (error) {
      console.error('Failed to fetch pending documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeFormData = (doc: any) => {
    if (doc.invoice) {
      setFormData({
        invoiceNumber: doc.invoice.invoiceNumber || '',
        vendorName: doc.invoice.vendorName || '',
        date: doc.invoice.date ? doc.invoice.date.split('T')[0] : '',
        totalAmount: doc.invoice.totalAmount || '',
        currency: doc.invoice.currency || 'USD',
      })
    } else if (doc.receipt) {
      setFormData({
        merchantName: doc.receipt.merchantName || '',
        date: doc.receipt.date ? doc.receipt.date.split('T')[0] : '',
        totalAmount: doc.receipt.totalAmount || '',
        taxAmount: doc.receipt.taxAmount || '',
      })
    } else if (doc.idCard) {
      setFormData({
        fullName: doc.idCard.fullName || '',
        idNumber: doc.idCard.idNumber || '',
        dateOfBirth: doc.idCard.dateOfBirth ? doc.idCard.dateOfBirth.split('T')[0] : '',
        address: doc.idCard.address || '',
      })
    } else if (doc.businessCard) {
      setFormData({
        name: doc.businessCard.name || '',
        company: doc.businessCard.company || '',
        email: doc.businessCard.email || '',
        phone: doc.businessCard.phone || '',
        address: doc.businessCard.address || '',
        website: doc.businessCard.website || '',
      })
    }
  }

  const handleSave = async () => {
    if (!document) return

    try {
      // In a real implementation, you would update the specific table (invoice, receipt, etc.)
      // For now, we'll just update the document status to verified
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' }),
      })

      if (response.ok) {
        alert('Document verified successfully!')
        setEditing(false)
        // Fetch next document
        fetchPendingDocuments()
      }
    } catch (error) {
      alert('Failed to save changes')
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">Loading document...</div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">No documents to review</p>
            <p className="text-sm text-gray-500 mt-2">
              Upload documents to get started
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const extractedData = document.invoice || document.receipt || document.idCard || document.businessCard
  const confidenceScore = extractedData?.confidenceScore || 0

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Review</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Verify and edit extracted data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Confidence Score</p>
            <p className={`text-2xl font-bold ${confidenceScore > 0.8 ? 'text-green-600' : confidenceScore > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(confidenceScore * 100)}%
            </p>
          </div>
          <Badge variant={document.status === 'verified' ? 'default' : 'secondary'}>
            {document.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Original Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
              {document.fileType.startsWith('image/') ? (
                <img
                  src={`/${document.filePath.replace(/^\.\//, '')}`}
                  alt={document.filename}
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">{document.filename}</p>
                  <p className="text-sm mt-1">PDF Preview not available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Extracted Data</CardTitle>
            <div className="flex gap-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)} variant="outline">
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={() => setEditing(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save & Verify
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.documentType === 'invoice' && (
              <>
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Vendor Name</Label>
                  <Input
                    value={formData.vendorName || ''}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount || ''}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </>
            )}

            {document.documentType === 'receipt' && (
              <>
                <div>
                  <Label>Merchant Name</Label>
                  <Input
                    value={formData.merchantName || ''}
                    onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount || ''}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Tax Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxAmount || ''}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </>
            )}

            {document.documentType === 'id_card' && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>ID Number</Label>
                  <Input
                    value={formData.idNumber || ''}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </>
            )}

            {document.documentType === 'business_card' && (
              <>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </>
            )}

            {!document.documentType && (
              <div className="text-center text-gray-500 py-8">
                <p>This document hasn't been processed yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
