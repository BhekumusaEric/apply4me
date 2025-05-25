'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, CheckCircle, Brain, Target, BookOpen, Briefcase } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface Question {
  id: string
  category: 'interests' | 'skills' | 'subjects' | 'work_preferences'
  question: string
  options: string[]
  multiSelect?: boolean
}

const questions: Question[] = [
  {
    id: '1',
    category: 'interests',
    question: 'Which activities do you enjoy most? (Select all that apply)',
    options: ['Problem solving', 'Helping others', 'Creating things', 'Working with numbers', 'Leading teams', 'Researching', 'Teaching', 'Building/fixing things'],
    multiSelect: true
  },
  {
    id: '2',
    category: 'subjects',
    question: 'Which school subjects did you perform best in?',
    options: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'English', 'History', 'Geography', 'Accounting', 'Business Studies'],
    multiSelect: true
  },
  {
    id: '3',
    category: 'work_preferences',
    question: 'What type of work environment appeals to you?',
    options: ['Office environment', 'Outdoor work', 'Laboratory/Research', 'Hospital/Clinic', 'School/University', 'Factory/Workshop', 'Remote work', 'Travel frequently'],
    multiSelect: true
  },
  {
    id: '4',
    category: 'skills',
    question: 'Which skills do you feel you have or want to develop?',
    options: ['Analytical thinking', 'Communication', 'Leadership', 'Creativity', 'Technical skills', 'Empathy', 'Organization', 'Innovation'],
    multiSelect: true
  },
  {
    id: '5',
    category: 'interests',
    question: 'What motivates you most in a career?',
    options: ['Making a difference', 'Financial success', 'Job security', 'Creativity and innovation', 'Recognition', 'Work-life balance', 'Continuous learning', 'Helping others'],
    multiSelect: true
  }
]

const careerMatches = {
  'engineering': {
    title: 'Engineering & Technology',
    description: 'Perfect for problem solvers who love building and creating',
    careers: ['Software Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer'],
    programs: ['Computer Science', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'],
    institutions: ['University of the Witwatersrand', 'University of Cape Town', 'Stellenbosch University']
  },
  'healthcare': {
    title: 'Healthcare & Medicine',
    description: 'Ideal for those passionate about helping others and making a difference',
    careers: ['Medical Doctor', 'Nurse', 'Pharmacist', 'Physiotherapist'],
    programs: ['Medicine', 'Nursing', 'Pharmacy', 'Physiotherapy'],
    institutions: ['University of Cape Town', 'University of the Witwatersrand', 'University of KwaZulu-Natal']
  },
  'business': {
    title: 'Business & Management',
    description: 'Great for natural leaders and those interested in commerce',
    careers: ['Business Analyst', 'Marketing Manager', 'Financial Advisor', 'Entrepreneur'],
    programs: ['Business Administration', 'Commerce', 'Marketing', 'Finance'],
    institutions: ['University of Cape Town', 'Stellenbosch University', 'University of the Witwatersrand']
  },
  'education': {
    title: 'Education & Teaching',
    description: 'Perfect for those who love sharing knowledge and shaping minds',
    careers: ['Teacher', 'Education Administrator', 'Curriculum Developer', 'Academic Researcher'],
    programs: ['Bachelor of Education', 'Teaching Diploma', 'Educational Psychology'],
    institutions: ['University of KwaZulu-Natal', 'University of the Free State', 'North-West University']
  }
}

export default function CareerProfilerPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const router = useRouter()

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, selectedOptions: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptions
    }))
  }

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateResults()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateResults = () => {
    // Simple matching algorithm based on answers
    const scores = {
      engineering: 0,
      healthcare: 0,
      business: 0,
      education: 0
    }

    // Score based on interests and preferences
    Object.values(answers).flat().forEach(answer => {
      if (['Problem solving', 'Creating things', 'Technical skills', 'Innovation'].includes(answer)) {
        scores.engineering += 1
      }
      if (['Helping others', 'Empathy', 'Life Sciences', 'Hospital/Clinic'].includes(answer)) {
        scores.healthcare += 1
      }
      if (['Leading teams', 'Financial success', 'Business Studies', 'Accounting'].includes(answer)) {
        scores.business += 1
      }
      if (['Teaching', 'Communication', 'English', 'School/University'].includes(answer)) {
        scores.education += 1
      }
    })

    // Get top matches
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a)
    const topMatches = sortedScores.slice(0, 2).map(([key]) => careerMatches[key as keyof typeof careerMatches])

    setResults(topMatches)
    setShowResults(true)
  }

  const currentQuestion = questions[currentStep]
  const isAnswered = answers[currentQuestion?.id]?.length > 0

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sa-green/10 mb-4">
                <CheckCircle className="h-8 w-8 text-sa-green" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Your Career Profile Results</h1>
              <p className="text-muted-foreground text-lg">
                Based on your responses, here are your top career matches
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {results?.map((match: any, index: number) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">#{index + 1} Match</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{match.title}</CardTitle>
                    <CardDescription>{match.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Career Options
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.careers.map((career: string) => (
                          <Badge key={career} variant="outline">{career}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Study Programs
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.programs.map((program: string) => (
                          <Badge key={program} variant="outline">{program}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Top Institutions
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {match.institutions.map((institution: string) => (
                          <li key={institution}>• {institution}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Apply?</h3>
              <p className="text-muted-foreground">
                Start your application journey with institutions that match your career goals
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push('/institutions')}>
                  Browse Institutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/auth/signup')}>
                  Create Account & Apply
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sa-green/10 mb-4">
              <Brain className="h-8 w-8 text-sa-green" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Career Profiler</h1>
            <p className="text-muted-foreground text-lg">
              Discover your ideal career path and matching study programs
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.multiSelect && (
                <CardDescription>You can select multiple options</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <QuestionOptions
                question={currentQuestion}
                selectedOptions={answers[currentQuestion.id] || []}
                onSelectionChange={(options) => handleAnswer(currentQuestion.id, options)}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={!isAnswered}
            >
              {currentStep === questions.length - 1 ? 'Get Results' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function QuestionOptions({ 
  question, 
  selectedOptions, 
  onSelectionChange 
}: {
  question: Question
  selectedOptions: string[]
  onSelectionChange: (options: string[]) => void
}) {
  const handleOptionClick = (option: string) => {
    if (question.multiSelect) {
      const newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter(o => o !== option)
        : [...selectedOptions, option]
      onSelectionChange(newSelection)
    } else {
      onSelectionChange([option])
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options.map((option) => {
        const isSelected = selectedOptions.includes(option)
        return (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-sa-green bg-sa-green/5 text-sa-green'
                : 'border-border hover:border-sa-green/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {isSelected && <CheckCircle className="h-5 w-5" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
