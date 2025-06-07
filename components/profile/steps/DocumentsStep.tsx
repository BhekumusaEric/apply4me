'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import { DocumentInfo, StudentProfile } from '@/lib/types/student-profile'

interface DocumentsStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { documents: any }) => void
  onBack?: () => void
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  fileUrl: string
  uploadDate: string
  fileSize: number
  mimeType: string
  isVerified: boolean
}

const REQUIRED_DOCUMENTS = [
  {
    type: 'ID_DOCUMENT',
    title: 'Identity Document',
    description: 'Copy of your South African ID or passport',
    required: true
  },
  {
    type: 'PASSPORT_PHOTO',
    title: 'Passport Photo',
    description: 'Recent passport-size photograph',
    required: true
  },
  {
    type: 'MATRIC_CERTIFICATE',
    title: 'Matric Certificate',
    description: 'Your Grade 12 certificate',
    required: true
  },
  {
    type: 'MATRIC_RESULTS',
    title: 'Matric Results',
    description: 'Your Grade 12 results statement',
    required: true
  },
  {
    type: 'INCOME_STATEMENT',
    title: 'Income Statement',
    description: 'Parent/guardian income statement for financial aid',
    required: false
  },
  {
    type: 'BANK_STATEMENT',
    title: 'Bank Statement',
    description: 'Recent bank statement (3 months)',
    required: false
  }
]

export default function DocumentsStep({ profile, onComplete, onBack }: DocumentsStepProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Handle file upload
  const handleFileUpload = async (documentType: string, file: File) => {
    setUploading(documentType)
    setErrors([])

    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, JPEG, and PNG files are allowed')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      // Upload to API
      const response = await fetch('/api/profile/documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Add to documents list
      setDocuments(prev => {
        const filtered = prev.filter(doc => doc.type !== documentType)
        return [...filtered, result.document]
      })

    } catch (error) {
      console.error('Upload error:', error)
      setErrors([error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setUploading(null)
    }
  }

  // Handle file selection
  const handleFileSelect = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(documentType, file)
    }
  }

  // Remove document
  const removeDocument = async (documentId: string, documentType: string) => {
    try {
      const response = await fetch(`/api/profile/documents?id=${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      }
    } catch (error) {
      console.error('Delete error:', error)
      setErrors(['Failed to remove document'])
    }
  }

  // Get document for type
  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.type === type)
  }

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required)
    const uploadedRequired = requiredDocs.filter(doc => getDocumentForType(doc.type))
    return Math.round((uploadedRequired.length / requiredDocs.length) * 100)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required)
    const missingDocs = requiredDocs.filter(doc => !getDocumentForType(doc.type))
    
    if (missingDocs.length > 0) {
      newErrors.push(`Missing required documents: ${missingDocs.map(doc => doc.title).join(', ')}`)
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)
      
      // Convert documents to the expected format
      const documentCollection = {
        identityDocument: getDocumentForType('ID_DOCUMENT'),
        passportPhoto: getDocumentForType('PASSPORT_PHOTO'),
        matricCertificate: getDocumentForType('MATRIC_CERTIFICATE'),
        matricResults: getDocumentForType('MATRIC_RESULTS'),
        parentIncomeStatements: documents.filter(doc => doc.type === 'INCOME_STATEMENT'),
        bankStatements: documents.filter(doc => doc.type === 'BANK_STATEMENT'),
        academicTranscripts: [],
        portfolioDocuments: [],
        affidavits: [],
        certifiedCopies: []
      }

      setTimeout(() => {
        onComplete({ documents: documentCollection })
        setIsLoading(false)
      }, 1000)
    }
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload Progress
          </CardTitle>
          <CardDescription>
            Upload required documents for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {REQUIRED_DOCUMENTS.filter(doc => doc.required && getDocumentForType(doc.type)).length} of {REQUIRED_DOCUMENTS.filter(doc => doc.required).length} required documents uploaded
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((docType) => {
          const uploadedDoc = getDocumentForType(docType.type)
          const isUploading = uploading === docType.type

          return (
            <Card key={docType.type} className={uploadedDoc ? 'border-green-200 bg-green-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{docType.title}</CardTitle>
                    {docType.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    {uploadedDoc && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  {uploadedDoc && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(uploadedDoc.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDocument(uploadedDoc.id, docType.type)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription>{docType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedDoc ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{uploadedDoc.name}</span>
                      <Badge variant={uploadedDoc.isVerified ? "default" : "secondary"}>
                        {uploadedDoc.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {new Date(uploadedDoc.uploadDate).toLocaleDateString()} • 
                      Size: {Math.round(uploadedDoc.fileSize / 1024)}KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[docType.type] = el
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(docType.type, e)}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRefs.current[docType.type]?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {docType.title}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PDF, JPEG, PNG (max 10MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={!onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
