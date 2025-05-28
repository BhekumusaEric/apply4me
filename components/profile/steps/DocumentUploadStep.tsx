'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye,
  Download,
  Shield,
  Camera,
  CreditCard,
  GraduationCap,
  Heart,
  FileCheck
} from 'lucide-react'
import { DocumentCollection, DocumentInfo, DocumentType, StudentProfile } from '@/lib/types/student-profile'

interface DocumentUploadStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { documents: DocumentCollection }) => void
  onBack?: () => void
}

interface RequiredDocument {
  type: DocumentType
  name: string
  description: string
  icon: any
  required: boolean
  maxSize: number // MB
  acceptedFormats: string[]
  examples?: string[]
}

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    type: 'ID_DOCUMENT',
    name: 'South African ID Document',
    description: 'Clear copy of your green ID book or smart ID card (both sides)',
    icon: CreditCard,
    required: true,
    maxSize: 5,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: ['Green ID book pages', 'Smart ID card front and back']
  },
  {
    type: 'PASSPORT_PHOTO',
    name: 'Passport Photo',
    description: 'Recent passport-size photograph (white background)',
    icon: Camera,
    required: true,
    maxSize: 2,
    acceptedFormats: ['JPG', 'PNG'],
    examples: ['Professional headshot', 'White background', 'Clear face visible']
  },
  {
    type: 'MATRIC_CERTIFICATE',
    name: 'Matric Certificate',
    description: 'Official NSC/IEB certificate or equivalent qualification',
    icon: GraduationCap,
    required: true,
    maxSize: 5,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: ['NSC Certificate', 'IEB Certificate', 'Cambridge Certificate']
  },
  {
    type: 'MATRIC_RESULTS',
    name: 'Matric Results/Statement',
    description: 'Official statement of results showing all subject marks',
    icon: FileCheck,
    required: true,
    maxSize: 5,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: ['Statement of Results', 'Academic Record', 'Subject marks']
  },
  {
    type: 'INCOME_STATEMENT',
    name: 'Parent/Guardian Income Statements',
    description: 'Salary slips, pension statements, or affidavit of income',
    icon: FileText,
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: ['3 months salary slips', 'Pension statement', 'Unemployment letter']
  },
  {
    type: 'BANK_STATEMENT',
    name: 'Bank Statements',
    description: '3 months bank statements for financial verification',
    icon: CreditCard,
    required: false,
    maxSize: 10,
    acceptedFormats: ['PDF'],
    examples: ['3 months statements', 'All pages included', 'Bank letterhead']
  },
  {
    type: 'MEDICAL_CERTIFICATE',
    name: 'Medical Certificate',
    description: 'Medical fitness certificate (if required by institution)',
    icon: Heart,
    required: false,
    maxSize: 5,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    examples: ['Doctor certificate', 'Medical examination', 'Health clearance']
  }
]

export default function DocumentUploadStep({ profile, onComplete, onBack }: DocumentUploadStepProps) {
  const [documents, setDocuments] = useState<DocumentCollection>(
    profile.documents || {
      identityDocument: {} as DocumentInfo,
      passportPhoto: {} as DocumentInfo,
      matricCertificate: {} as DocumentInfo,
      matricResults: {} as DocumentInfo,
      academicTranscripts: [],
      parentIncomeStatements: [],
      bankStatements: [],
      portfolioDocuments: [],
      affidavits: [],
      certifiedCopies: []
    }
  )

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Calculate completion percentage
  const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required)
  const uploadedRequired = requiredDocs.filter(doc => {
    const docKey = getDocumentKey(doc.type)
    return documents[docKey as keyof DocumentCollection] && 
           (documents[docKey as keyof DocumentCollection] as any).fileUrl
  }).length
  const completionPercentage = (uploadedRequired / requiredDocs.length) * 100

  // Get document key from type
  function getDocumentKey(type: DocumentType): string {
    const mapping: { [key in DocumentType]: string } = {
      'ID_DOCUMENT': 'identityDocument',
      'PASSPORT_PHOTO': 'passportPhoto',
      'MATRIC_CERTIFICATE': 'matricCertificate',
      'MATRIC_RESULTS': 'matricResults',
      'ACADEMIC_TRANSCRIPT': 'academicTranscripts',
      'INCOME_STATEMENT': 'parentIncomeStatements',
      'BANK_STATEMENT': 'bankStatements',
      'AFFIDAVIT_SUPPORT': 'affidavits',
      'MEDICAL_CERTIFICATE': 'medicalCertificate',
      'POLICE_CLEARANCE': 'policeClearance',
      'MOTIVATION_LETTER': 'motivationLetter',
      'CV': 'cv',
      'PORTFOLIO': 'portfolioDocuments',
      'AFFIDAVIT': 'affidavits',
      'CERTIFIED_COPY': 'certifiedCopies',
      'OTHER': 'portfolioDocuments'
    }
    return mapping[type] || 'portfolioDocuments'
  }

  // Handle file upload
  const handleFileUpload = async (file: File, docType: DocumentType) => {
    const docKey = getDocumentKey(docType)
    
    // Validate file
    const doc = REQUIRED_DOCUMENTS.find(d => d.type === docType)
    if (!doc) return

    if (file.size > doc.maxSize * 1024 * 1024) {
      setErrors(prev => [...prev, `${doc.name}: File size must be less than ${doc.maxSize}MB`])
      return
    }

    const fileExtension = file.name.split('.').pop()?.toUpperCase()
    if (!doc.acceptedFormats.includes(fileExtension || '')) {
      setErrors(prev => [...prev, `${doc.name}: Only ${doc.acceptedFormats.join(', ')} files are allowed`])
      return
    }

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [docType]: 0 }))
    
    // Mock upload process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(prev => ({ ...prev, [docType]: i }))
    }

    // Create document info
    const documentInfo: DocumentInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      type: docType,
      fileUrl: URL.createObjectURL(file), // In real app, this would be uploaded to cloud storage
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
      mimeType: file.type,
      isVerified: false
    }

    // Update documents
    if (docKey.endsWith('s')) {
      // Array field
      setDocuments(prev => ({
        ...prev,
        [docKey]: [...(prev[docKey as keyof DocumentCollection] as DocumentInfo[] || []), documentInfo]
      }))
    } else {
      // Single field
      setDocuments(prev => ({
        ...prev,
        [docKey]: documentInfo
      }))
    }

    // Clear upload progress
    setTimeout(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[docType]
        return newProgress
      })
    }, 500)
  }

  // Remove document
  const removeDocument = (docType: DocumentType, docId?: string) => {
    const docKey = getDocumentKey(docType)
    
    if (docKey.endsWith('s') && docId) {
      // Array field
      setDocuments(prev => ({
        ...prev,
        [docKey]: (prev[docKey as keyof DocumentCollection] as DocumentInfo[]).filter(doc => doc.id !== docId)
      }))
    } else {
      // Single field
      setDocuments(prev => ({
        ...prev,
        [docKey]: {} as DocumentInfo
      }))
    }
  }

  // Trigger file input
  const triggerFileInput = (docType: DocumentType) => {
    const input = fileInputRefs.current[docType]
    if (input) {
      input.click()
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    requiredDocs.forEach(doc => {
      const docKey = getDocumentKey(doc.type)
      const uploadedDoc = documents[docKey as keyof DocumentCollection]
      
      if (!uploadedDoc || !(uploadedDoc as any).fileUrl) {
        newErrors.push(`${doc.name} is required`)
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        onComplete({ documents })
        setIsLoading(false)
      }, 1000)
    }
  }

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
            {uploadedRequired} of {requiredDocs.length} required documents uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(completionPercentage)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Document Security:</strong> All documents are encrypted and stored securely. 
          Only you and authorized Apply4Me staff can access your documents. 
          We never share your documents with third parties without your explicit consent.
        </AlertDescription>
      </Alert>

      {/* Document Upload Cards */}
      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const docKey = getDocumentKey(doc.type)
          const uploadedDoc = documents[docKey as keyof DocumentCollection] as DocumentInfo
          const isUploaded = uploadedDoc && uploadedDoc.fileUrl
          const isUploading = uploadProgress[doc.type] !== undefined
          const progress = uploadProgress[doc.type] || 0

          return (
            <Card key={doc.type} className={`${isUploaded ? 'border-green-200 bg-green-50' : doc.required ? 'border-orange-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isUploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <doc.icon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {doc.name}
                        {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        {isUploaded && <Badge variant="default" className="text-xs bg-green-600">Uploaded</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {doc.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Max: {doc.maxSize}MB</span>
                        <span>Formats: {doc.acceptedFormats.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isUploaded && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => window.open(uploadedDoc.fileUrl, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeDocument(doc.type)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant={isUploaded ? "outline" : "default"} 
                      size="sm"
                      onClick={() => triggerFileInput(doc.type)}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploaded ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isUploading && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
              )}

              {doc.examples && (
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> {doc.examples.join(', ')}
                  </div>
                </CardContent>
              )}

              {/* Hidden file input */}
              <input
                ref={el => fileInputRefs.current[doc.type] = el}
                type="file"
                accept={doc.acceptedFormats.map(format => `.${format.toLowerCase()}`).join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file, doc.type)
                  }
                }}
                style={{ display: 'none' }}
              />
            </Card>
          )
        })}
      </div>

      {/* Tips */}
      <Alert>
        <FileCheck className="h-4 w-4" />
        <AlertDescription>
          <strong>Document Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Ensure all documents are clear and readable</li>
            <li>Scan or photograph documents in good lighting</li>
            <li>Include all pages of multi-page documents</li>
            <li>Use certified copies where required by institutions</li>
            <li>Keep original documents safe for verification</li>
          </ul>
        </AlertDescription>
      </Alert>

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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || completionPercentage < 100}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
