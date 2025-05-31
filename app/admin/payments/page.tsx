'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/admin-nav'

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/payments?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch payments:', result.error)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const handleSearch = () => {
    fetchPayments()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payments...</div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      title="Payments Dashboard"
      description="Track PayFast transactions, revenue, and payment analytics"
      breadcrumb={[{ name: 'Payments' }]}
    >
      <div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">R{data.summary.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed Transactions</p>
                  <p className="text-2xl font-bold">{data.summary.completedTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{data.summary.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending Revenue</p>
                  <p className="text-2xl font-bold">R{data.summary.pendingRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold">{data.summary.completedTransactions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold">{data.summary.pendingTransactions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-xl font-bold">{data.summary.failedTransactions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-xl font-bold">{data.summary.refundedTransactions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-xl font-bold">R{data.summary.averageTransactionValue}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by student name, email, reference, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Quick Stats */}
      {data && data.payments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-2">
                {data.payments.length} Payment{data.payments.length !== 1 ? 's' : ''} Found
              </h3>
              <p className="text-gray-600">
                Total value: R{data.payments.reduce((sum: number, p: any) => sum + p.amount, 0).toLocaleString()}
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">PayFast Transactions</p>
                  <p className="text-lg font-bold">{data.payments.filter((p: any) => p.paymentMethod === 'payfast').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Card Payments</p>
                  <p className="text-lg font-bold">{data.payments.filter((p: any) => p.paymentMethod === 'card').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">EFT Payments</p>
                  <p className="text-lg font-bold">{data.payments.filter((p: any) => p.paymentMethod === 'eft').length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {data && data.payments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
            <p className="text-gray-500">
              {search ? 'No payments match your search criteria.' : 'No payment transactions have been recorded yet.'}
            </p>
            {search && (
              <Button
                variant="outline"
                onClick={() => {setSearch(''); handleSearch()}}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  )
}
