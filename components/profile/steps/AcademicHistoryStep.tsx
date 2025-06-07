'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap,
  School,
  Trophy,
  AlertCircle,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react'
import { AcademicHistory, MatricInformation, MatricSubject, StudentProfile } from '@/lib/types/student-profile'

interface AcademicHistoryStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { academicHistory: AcademicHistory }) => void
  onBack?: () => void
}

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

const SCHOOL_TYPES = ['Public', 'Private', 'Model C', 'Independent']
const MATRIC_TYPES = ['NSC', 'IEB', 'Cambridge', 'Other']
const OVERALL_RESULTS = ['Bachelor Pass', 'Diploma Pass', 'Higher Certificate Pass', 'Pass']
const SUBJECT_LEVELS = ['Higher Grade', 'Standard Grade', 'Foundation', 'Core', 'Elective']
const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// Common SA matric subjects
const COMMON_SUBJECTS = [
  'English Home Language', 'English First Additional Language', 'Afrikaans Home Language', 
  'Afrikaans First Additional Language', 'Mathematics', 'Mathematical Literacy',
  'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Life Orientation',
  'Accounting', 'Business Studies', 'Economics', 'Tourism', 'Information Technology',
  'Computer Applications Technology', 'Engineering Graphics and Design', 'Civil Technology',
  'Electrical Technology', 'Mechanical Technology', 'Agricultural Sciences',
  'Consumer Studies', 'Hospitality Studies', 'Visual Arts', 'Dramatic Arts', 'Music',
  'Dance Studies', 'Design', 'isiZulu', 'isiXhosa', 'Sepedi', 'Sesotho', 'Setswana',
  'siSwati', 'Tshivenda', 'Xitsonga', 'isiNdebele'
]

export default function AcademicHistoryStep({ profile, onComplete, onBack }: AcademicHistoryStepProps) {
  const [academicHistory, setAcademicHistory] = useState<AcademicHistory>(() => {
    const defaultAcademicHistory: AcademicHistory = {
      matricInfo: {
        year: new Date().getFullYear() - 1,
        school: '',
        schoolType: 'Public',
        province: '',
        matricType: 'NSC',
        overallResult: 'Bachelor Pass',
        apsScore: 0,
        subjects: [],
        additionalCertificates: []
      },
      previousStudies: [],
      achievements: [],
      careerInterests: []
    }

    // Safely merge with existing profile data
    if (profile.academicHistory) {
      return {
        ...defaultAcademicHistory,
        ...profile.academicHistory,
        matricInfo: {
          ...defaultAcademicHistory.matricInfo,
          ...(profile.academicHistory.matricInfo || {})
        }
      }
    }

    return defaultAcademicHistory
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Add new subject
  const addSubject = () => {
    const newSubject: MatricSubject = {
      name: '',
      level: 'Core',
      mark: 0,
      symbol: 'F',
      isLanguage: false,
      isMathematics: false,
      isScience: false
    }

    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: [...prev.matricInfo.subjects, newSubject]
      }
    }))
  }

  // Remove subject
  const removeSubject = (index: number) => {
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: prev.matricInfo.subjects.filter((_, i) => i !== index)
      }
    }))
  }

  // Update subject
  const updateSubject = (index: number, field: keyof MatricSubject, value: any) => {
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        subjects: prev.matricInfo.subjects.map((subject, i) => 
          i === index ? { ...subject, [field]: value } : subject
        )
      }
    }))

    // Auto-detect subject types
    if (field === 'name') {
      const subjectName = value.toLowerCase()
      const isLanguage = subjectName.includes('language') || subjectName.includes('afrikaans') || 
                        subjectName.includes('english') || ['isizulu', 'isixhosa', 'sepedi', 'sesotho', 'setswana', 'siswati', 'tshivenda', 'xitsonga', 'isindebele'].some(lang => subjectName.includes(lang))
      const isMathematics = subjectName.includes('mathematics') || subjectName.includes('mathematical')
      const isScience = subjectName.includes('sciences') || subjectName.includes('physics') || subjectName.includes('chemistry') || subjectName.includes('biology')

      setAcademicHistory(prev => ({
        ...prev,
        matricInfo: {
          ...prev.matricInfo,
          subjects: prev.matricInfo.subjects.map((subject, i) => 
            i === index ? { 
              ...subject, 
              isLanguage, 
              isMathematics, 
              isScience 
            } : subject
          )
        }
      }))
    }
  }

  // Calculate APS Score
  const calculateAPS = () => {
    const subjects = academicHistory.matricInfo?.subjects || []
    if (subjects.length < 6) return 0

    // APS calculation: sum of best 6 subjects (7 for A, 6 for B, etc.)
    const apsValues: { [key: string]: number } = {
      'A': 7, 'B': 6, 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'G': 1
    }

    const scores = subjects
      .map(subject => apsValues[subject.symbol] || 0)
      .sort((a, b) => b - a)
      .slice(0, 6)

    const apsScore = scores.reduce((sum, score) => sum + score, 0)
    
    setAcademicHistory(prev => ({
      ...prev,
      matricInfo: {
        ...prev.matricInfo,
        apsScore
      }
    }))

    return apsScore
  }

  // Convert mark to symbol
  const markToSymbol = (mark: number): string => {
    if (mark >= 80) return 'A'
    if (mark >= 70) return 'B'
    if (mark >= 60) return 'C'
    if (mark >= 50) return 'D'
    if (mark >= 40) return 'E'
    if (mark >= 30) return 'F'
    return 'G'
  }

  // Update mark and auto-calculate symbol
  const updateSubjectMark = (index: number, mark: number) => {
    const symbol = markToSymbol(mark)
    updateSubject(index, 'mark', mark)
    updateSubject(index, 'symbol', symbol)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!academicHistory.matricInfo.school) newErrors.push('School name is required')
    if (!academicHistory.matricInfo.province) newErrors.push('School province is required')
    if (academicHistory.matricInfo.year < 1990 || academicHistory.matricInfo.year > new Date().getFullYear()) {
      newErrors.push('Please enter a valid matric year')
    }

    if ((academicHistory.matricInfo?.subjects || []).length < 6) {
      newErrors.push('At least 6 subjects are required for matric')
    }

    // Validate each subject
    (academicHistory.matricInfo?.subjects || []).forEach((subject, index) => {
      if (!subject.name) newErrors.push(`Subject ${index + 1}: Name is required`)
      if (subject.mark < 0 || subject.mark > 100) newErrors.push(`Subject ${index + 1}: Mark must be between 0 and 100`)
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    calculateAPS() // Ensure APS is calculated
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        onComplete({ academicHistory })
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
            <School className="h-5 w-5" />
            Matric/Grade 12 Information
          </CardTitle>
          <CardDescription>
            Your Grade 12 qualification details
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
                  matricInfo: { ...prev.matricInfo, school: e.target.value }
                }))}
                placeholder="Your high school name"
              />
            </div>

            <div>
              <Label htmlFor="schoolType">School Type</Label>
              <Select 
                value={academicHistory.matricInfo?.schoolType || 'Public'}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo, schoolType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="matricYear">Matric Year *</Label>
              <Input
                id="matricYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={academicHistory.matricInfo?.year || new Date().getFullYear() - 1}
                onChange={(e) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo, year: parseInt(e.target.value) || new Date().getFullYear() }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="schoolProvince">School Province *</Label>
              <Select 
                value={academicHistory.matricInfo?.province || ''}
                onValueChange={(value) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo, province: value }
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

            <div>
              <Label htmlFor="matricType">Matric Type</Label>
              <Select 
                value={academicHistory.matricInfo?.matricType || 'NSC'}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo, matricType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATRIC_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overallResult">Overall Result</Label>
              <Select 
                value={academicHistory.matricInfo?.overallResult || 'Bachelor Pass'}
                onValueChange={(value: any) => setAcademicHistory(prev => ({
                  ...prev,
                  matricInfo: { ...prev.matricInfo, overallResult: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OVERALL_RESULTS.map(result => (
                    <SelectItem key={result} value={result}>{result}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="apsScore">APS Score</Label>
              <div className="flex gap-2">
                <Input
                  id="apsScore"
                  type="number"
                  value={academicHistory.matricInfo?.apsScore || 0}
                  readOnly
                  className="bg-muted"
                />
                <Button type="button" variant="outline" size="sm" onClick={calculateAPS}>
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Calculated from your subject results
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Subject Results
          </CardTitle>
          <CardDescription>
            Add your matric subject results (minimum 6 subjects required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(academicHistory.matricInfo?.subjects || []).map((subject, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Subject {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSubject(index)}
                  disabled={(academicHistory.matricInfo?.subjects || []).length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`subject-${index}`}>Subject Name *</Label>
                  <Select
                    value={subject.name}
                    onValueChange={(value) => updateSubject(index, 'name', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SUBJECTS.map(subjectName => (
                        <SelectItem key={subjectName} value={subjectName}>{subjectName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`mark-${index}`}>Mark (%) *</Label>
                  <Input
                    id={`mark-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={subject.mark}
                    onChange={(e) => updateSubjectMark(index, parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor={`symbol-${index}`}>Symbol</Label>
                  <Input
                    id={`symbol-${index}`}
                    value={subject.symbol}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <Badge variant={subject.isLanguage ? "default" : "outline"}>
                  Language: {subject.isLanguage ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={subject.isMathematics ? "default" : "outline"}>
                  Mathematics: {subject.isMathematics ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={subject.isScience ? "default" : "outline"}>
                  Science: {subject.isScience ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addSubject} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>

          {(academicHistory.matricInfo?.subjects || []).length >= 6 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">APS Score: {academicHistory.matricInfo?.apsScore || 0}</h4>
                  <p className="text-sm text-green-700">
                    Based on your best 6 subjects. Click calculate to update.
                  </p>
                </div>
              </div>
            </div>
          )}
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
