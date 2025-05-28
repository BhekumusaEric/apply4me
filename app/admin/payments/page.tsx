'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  CreditCard,
  Building2,
  Smartphone,
  AlertCircle,
  User,
  Calendar,
  DollarSign
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PendingPayment {
  id: string
  paymentReference: string
  paymentMethod: string
  paymentDate: string
  amount: number
  status: string
  verificationStatus?: string
  applicationStatus: string
  createdAt: string
  studentName: string
  studentEmail: string
  studentPhone: string
  institutionName: string
  institutionLogo?: string
}

export default function AdminPaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending_verification')

  useEffect(() => {
    fetchPendingPayments()
  }, [filterStatus])

  const fetchPendingPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payments/verify?status=${filterStatus}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setPendingPayments(data.applications)
      } else {
        console.error('Failed to fetch pending payments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (applicationId: string, status: 'verified' | 'rejected') => {
    try {
      setVerifying(applicationId)
      
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes: verificationNotes.trim() || undefined,
          verifiedBy: 'Admin User' // In real app, get from auth context
        })
      })

      const result = await response.json()

      if (result.success) {
        // Remove from pending list
        setPendingPayments(prev => prev.filter(p => p.id !== applicationId))
        setSelectedPayment(null)
        setVerificationNotes('')
        
        // Show success message
        alert(`Payment ${status} successfully! User has been notified.`)
      } else {
        alert(`Failed to ${status} payment: ${result.error}`)
      }
    } catch (error) {
      console.error('Verification error:', error)
      alert('Failed to process verification. Please try again.')
    } finally {
      setVerifying(null)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'eft': return <Building2 className="h-4 w-4" />
      case 'mobile': case 'tymebank': return <Smartphone className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredPayments = pendingPayments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Verification</h1>
        <p className="text-muted-foreground">
          Review and verify student payments for applications
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by student name, reference, institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'pending_verification' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('pending_verification')}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingPayments.length})
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Card Payments</p>
                <p className="text-2xl font-bold">
                  {pendingPayments.filter(p => p.paymentMethod === 'card').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bank Transfers</p>
                <p className="text-2xl font-bold">
                  {pendingPayments.filter(p => ['eft', 'tymebank'].includes(p.paymentMethod)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {filterStatus === 'pending_verification' ? 'Pending Verification' : 'Verified Payments'} 
            ({filteredPayments.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No payments match your search criteria.' : 'No pending payments to verify.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className={`cursor-pointer transition-all ${
                  selectedPayment?.id === payment.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPayment(payment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="font-medium">{payment.paymentReference}</span>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{payment.studentName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{payment.institutionName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(payment.paymentDate)}</span>
                      </div>
                      <span className="font-bold text-lg">{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Details and Verification */}
        <div className="lg:sticky lg:top-4">
          {selectedPayment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Review payment information and verify or reject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Information */}
                <div>
                  <h4 className="font-medium mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedPayment.studentName}</div>
                    <div><strong>Email:</strong> {selectedPayment.studentEmail}</div>
                    <div><strong>Phone:</strong> {selectedPayment.studentPhone}</div>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h4 className="font-medium mb-3">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Reference:</strong> {selectedPayment.paymentReference}</div>
                    <div><strong>Method:</strong> {selectedPayment.paymentMethod.toUpperCase()}</div>
                    <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
                    <div><strong>Date:</strong> {formatDate(selectedPayment.paymentDate)}</div>
                    <div><strong>Institution:</strong> {selectedPayment.institutionName}</div>
                  </div>
                </div>

                <Separator />

                {/* Verification Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about this payment verification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                {filterStatus === 'pending_verification' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                      disabled={verifying === selectedPayment.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {verifying === selectedPayment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Verify Payment
                    </Button>
                    
                    <Button
                      onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                      disabled={verifying === selectedPayment.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {verifying === selectedPayment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Payment</h3>
                <p className="text-muted-foreground">
                  Click on a payment from the list to view details and verify
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
