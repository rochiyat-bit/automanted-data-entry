'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center text-red-600">Failed to load dashboard statistics</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      description: 'All uploaded documents',
      color: 'text-blue-600',
    },
    {
      title: 'Processed',
      value: stats.processedDocuments,
      description: 'Successfully processed',
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: stats.pendingDocuments,
      description: 'Awaiting processing',
      color: 'text-yellow-600',
    },
    {
      title: 'Failed',
      value: stats.failedDocuments,
      description: 'Processing failed',
      color: 'text-red-600',
    },
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Overview of your document processing system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Rate Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Overall processing success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-green-600">{stats.successRate}%</div>
            <div className="ml-4 flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${stats.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents by Type */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Documents by Type</CardTitle>
          <CardDescription>Breakdown of processed document types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.documentsByType.invoice}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Invoices</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.documentsByType.receipt}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Receipts</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.documentsByType.id_card}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ID Cards</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.documentsByType.business_card}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Business Cards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 text-sm border-b pb-3 last:border-0"
                >
                  <Badge variant="outline" className="mt-0.5">
                    {activity.action}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-gray-600 dark:text-gray-400">
                      {activity.tableName} - {activity.recordId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
