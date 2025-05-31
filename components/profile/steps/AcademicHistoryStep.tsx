'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { AcademicHistory, MatricSubject, StudentProfile } from '@/lib/types/student-profile'

interface AcademicHistoryStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { academicHistory: AcademicHistory }) => void
  onBack?: () => void
}

const MATRIC_SUBJECTS = [
  'English Home Language', 'English First Additional Language', 'Afrikaans Home Language', 'Afrikaans First Additional Language',
  'isiZulu Home Language', 'isiZulu First Additional Language', 'isiXhosa Home Language', 'isiXhosa First Additional Language',
  'Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences', 'Geography', 'History',
  'Business Studies', 'Economics', 'Accounting', 'Life Orientation', 'Information Technology',
  'Computer Applications Technology', 'Engineering Graphics and Design', 'Visual Arts', 'Music', 'Dramatic Arts'
]

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

export default function AcademicHistoryStep({ profile, onComplete, onBack }: AcademicHistoryStepProps) {
  // Create default academic history structure
  const defaultAcademicHistory: AcademicHistory = {
    matricInfo: {
      year: new Date().getFullYear() - 1,
      school: '',
      schoolType: 'Public',
      province: '',
      matricType: 'NSC',
      overallResult: 'Bachelor Pass',
      subjects: [],
      additionalCertificates: []
    },
    previousStudies: [],
    achievements: [],
    careerInterests: []
  }

  const [academicHistory, setAcademicHistory] = useState<AcademicHistory>(() => {
    if (!profile.academicHistory) return defaultAcademicHistory

    // Merge with defaults to ensure all nested objects exist
    return {
      ...defaultAcademicHistory,
      ...profile.academicHistory,
      matricInfo: {
        ...defaultAcademicHistory.matricInfo,
        ...(profile.academicHistory.matricInfo || {}),
        subjects: profile.academicHistory.matricInfo?.subjects || [],
        additionalCertificates: profile.academicHistory.matricInfo?.additionalCertificates || []
      },
      previousStudies: profile.academicHistory.previousStudies || [],
      achievements: profile.academicHistory.achievements || [],
      careerInterests: profile.academicHistory.careerInterests || []
    }
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Add subject
  const addSubject = () => {
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: [
          ...(prev.matricInfo?.subjects || []),
          {
            name: '',
            level: 'Higher Grade',
            mark: 0,
            symbol: 'F',
            isLanguage: false,
            isMathematics: false,
            isScience: false
          } as MatricSubject
        ]
      }
    }))
  }

  // Remove subject
  const removeSubject = (index: number) => {
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: (prev.matricInfo?.subjects || []).filter((_, i) => i !== index)
      }
    }))
  }

  // Update subject
  const updateSubject = (index: number, field: keyof MatricSubject, value: any) => {
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: (prev.matricInfo?.subjects || []).map((subject, i) =>
          i === index ? {
            ...subject,
            [field]: value,
            // Auto-detect subject types
            isLanguage: field === 'name' ? value.toLowerCase().includes('language') || value.toLowerCase().includes('english') || value.toLowerCase().includes('afrikaans') || value.toLowerCase().includes('zulu') || value.toLowerCase().includes('xhosa') : subject.isLanguage,
            isMathematics: field === 'name' ? value.toLowerCase().includes('mathematics') || value.toLowerCase().includes('mathematical') : subject.isMathematics,
            isScience: field === 'name' ? value.toLowerCase().includes('science') || value.toLowerCase().includes('physics') || value.toLowerCase().includes('chemistry') || value.toLowerCase().includes('biology') : subject.isScience,
            // Auto-calculate symbol from mark
            symbol: field === 'mark' ? getSymbolFromMark(value) : subject.symbol
          } : subject
        )
      }
    }))
  }

  // Get symbol from mark
  const getSymbolFromMark = (mark: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' => {
    if (mark >= 80) return 'A'
    if (mark >= 70) return 'B'
    if (mark >= 60) return 'C'
    if (mark >= 50) return 'D'
    if (mark >= 40) return 'E'
    if (mark >= 30) return 'F'
    return 'G'
  }

  // Calculate APS
  const calculateAPS = (): number => {
    const subjects = academicHistory.matricInfo?.subjects || []
    const apsSubjects = subjects.slice(0, 6) // Top 6 subjects for APS
    return apsSubjects.reduce((total, subject) => {
      const mark = subject.mark
      if (mark >= 80) return total + 7
      if (mark >= 70) return total + 6
      if (mark >= 60) return total + 5
      if (mark >= 50) return total + 4
      if (mark >= 40) return total + 3
      if (mark >= 30) return total + 2
      return total + 1
    }, 0)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!academicHistory.matricInfo?.school) newErrors.push('School name is required')
    if (!academicHistory.matricInfo?.province) newErrors.push('School province is required')
    if (!academicHistory.matricInfo?.subjects || academicHistory.matricInfo.subjects.length < 6) {
      newErrors.push('At least 6 subjects are required')
    }

    // Check for required subjects
    const subjects = academicHistory.matricInfo?.subjects || []
    const hasLanguage = subjects.some(s => s.isLanguage && s.mark >= 40)
    const hasMaths = subjects.some(s => s.isMathematics && s.mark >= 30)

    if (!hasLanguage) {
      newErrors.push('At least one language with 40%+ is required')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)

      // Calculate APS
      const apsScore = calculateAPS()
      const updatedHistory = {
        ...academicHistory,
        matricInfo: {
          ...academicHistory.matricInfo!,
          apsScore
        }
      }

      setTimeout(() => {
        onComplete({ academicHistory: updatedHistory })
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Matric Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Matric Information
          </CardTitle>
          <CardDescription>
            Your Grade 12 / Matric qualification details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school">School Name *</Label>
              <Input
                id="school"
                value={academicHistory.matricInfo?.school || ''}
                onChange={(e) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, school: e.target.value }
                }))}
                placeholder="Your high school name"
              />
            </div>

            <div>
              <Label htmlFor="province">School Province *</Label>
              <Select
                value={academicHistory.matricInfo?.province || ''}
                onValueChange={(value) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, province: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Matric Year</Label>
              <Input
                id="year"
                type="number"
                value={academicHistory.matricInfo?.year || ''}
                onChange={(e) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, year: parseInt(e.target.value) }
                }))}
                placeholder="2023"
              />
            </div>

            <div>
              <Label htmlFor="schoolType">School Type</Label>
              <Select
                value={academicHistory.matricInfo?.schoolType || 'Public'}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, schoolType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public School</SelectItem>
                  <SelectItem value="Private">Private School</SelectItem>
                  <SelectItem value="Independent">Independent School</SelectItem>
                  <SelectItem value="Model C">Model C School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matricType">Qualification Type</Label>
              <Select
                value={academicHistory.matricInfo?.matricType}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, matricType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NSC">NSC (National Senior Certificate)</SelectItem>
                  <SelectItem value="IEB">IEB (Independent Examinations Board)</SelectItem>
                  <SelectItem value="Cambridge">Cambridge International</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="overallResult">Overall Result</Label>
              <Select
                value={academicHistory.matricInfo?.overallResult}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo!, overallResult: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bachelor Pass">Bachelor Pass</SelectItem>
                  <SelectItem value="Diploma Pass">Diploma Pass</SelectItem>
                  <SelectItem value="Higher Certificate Pass">Higher Certificate Pass</SelectItem>
                  <SelectItem value="Pass">Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Matric Subjects</CardTitle>
              <CardDescription>
                Add your matric subjects and marks. APS: {calculateAPS()}
              </CardDescription>
            </div>
            <Button onClick={addSubject} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(academicHistory.matricInfo?.subjects || []).map((subject, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label>Subject</Label>
                  <Select
                    value={subject.name}
                    onValueChange={(value) => updateSubject(index, 'name', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATRIC_SUBJECTS.map(subj => (
                        <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Mark %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={subject.mark}
                    onChange={(e) => updateSubject(index, 'mark', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Symbol</Label>
                  <Input
                    value={subject.symbol}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="col-span-3">
                  <Label>Level</Label>
                  <Select
                    value={subject.level}
                    onValueChange={(value: any) => updateSubject(index, 'level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Higher Grade">Higher Grade</SelectItem>
                      <SelectItem value="Standard Grade">Standard Grade</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubject(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {(academicHistory.matricInfo?.subjects || []).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No subjects added yet. Click "Add Subject" to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
