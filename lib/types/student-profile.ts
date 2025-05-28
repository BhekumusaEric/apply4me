/**
 * Comprehensive Student Profile Types for South African Higher Education Applications
 * Covers all requirements for universities, TVET colleges, and private institutions
 */

export interface StudentProfile {
  // Basic Information
  personalInfo: PersonalInformation
  contactInfo: ContactInformation
  academicHistory: AcademicHistory
  documents: DocumentCollection
  preferences: StudentPreferences
  applicationReadiness: ApplicationReadiness
  
  // Metadata
  profileCompleteness: number // 0-100%
  lastUpdated: string
  isVerified: boolean
  createdAt: string
}

export interface PersonalInformation {
  // Identity Details (Required for all SA institutions)
  idNumber: string // SA ID Number (13 digits)
  passportNumber?: string // For international students
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  
  // Demographics (Required for BBBEE and funding applications)
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  race: 'African' | 'Coloured' | 'Indian' | 'White' | 'Other' | 'Prefer not to say'
  nationality: string
  homeLanguage: string
  additionalLanguages: string[]
  
  // Disability & Special Needs (Required for accommodation)
  hasDisability: boolean
  disabilityType?: string[]
  requiresAccommodation: boolean
  accommodationDetails?: string
  
  // Family & Socioeconomic (Required for financial aid)
  parentGuardianInfo: ParentGuardianInfo[]
  householdIncome: HouseholdIncomeRange
  dependents: number
  isFirstGeneration: boolean // First in family to attend higher education
  
  // Geographic Information
  citizenship: 'South African' | 'Permanent Resident' | 'International'
  birthProvince?: string
  currentProvince: string
  ruralUrban: 'Rural' | 'Urban' | 'Semi-urban'
}

export interface ContactInformation {
  // Primary Contact
  email: string
  phone: string
  alternativePhone?: string
  
  // Addresses
  currentAddress: Address
  permanentAddress: Address
  postalAddress?: Address
  
  // Emergency Contact
  emergencyContact: EmergencyContact
  
  // Communication Preferences
  preferredContactMethod: 'Email' | 'SMS' | 'WhatsApp' | 'Phone'
  communicationLanguage: string
}

export interface Address {
  streetAddress: string
  suburb: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: Address
}

export interface ParentGuardianInfo {
  type: 'Mother' | 'Father' | 'Guardian' | 'Other'
  name: string
  idNumber?: string
  occupation: string
  employer?: string
  phone: string
  email?: string
  educationLevel: EducationLevel
  isDeceased: boolean
  monthlyIncome?: number
}

export interface AcademicHistory {
  // Matric/Grade 12 Information
  matricInfo: MatricInformation
  
  // Previous Higher Education (if any)
  previousStudies: PreviousStudy[]
  
  // Current Studies (if applicable)
  currentStudies?: CurrentStudy
  
  // Academic Achievements
  achievements: AcademicAchievement[]
  
  // Career Interests
  careerInterests: CareerInterest[]
}

export interface MatricInformation {
  year: number
  school: string
  schoolType: 'Public' | 'Private' | 'Model C' | 'Independent'
  province: string
  
  // Matric Results
  matricType: 'NSC' | 'IEB' | 'Cambridge' | 'Other'
  overallResult: 'Bachelor Pass' | 'Diploma Pass' | 'Higher Certificate Pass' | 'Pass'
  apsScore?: number // Admission Point Score
  
  // Subject Results
  subjects: MatricSubject[]
  
  // Additional Qualifications
  additionalCertificates: string[]
}

export interface MatricSubject {
  name: string
  level: 'Higher Grade' | 'Standard Grade' | 'Foundation' | 'Core' | 'Elective'
  mark: number
  symbol: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  isLanguage: boolean
  isMathematics: boolean
  isScience: boolean
}

export interface PreviousStudy {
  institution: string
  qualification: string
  fieldOfStudy: string
  startDate: string
  endDate?: string
  status: 'Completed' | 'In Progress' | 'Discontinued' | 'Deferred'
  reason?: string // If discontinued
  transcriptAvailable: boolean
}

export interface CurrentStudy {
  institution: string
  qualification: string
  fieldOfStudy: string
  yearOfStudy: number
  expectedCompletion: string
  currentGPA?: number
}

export interface AcademicAchievement {
  type: 'Award' | 'Scholarship' | 'Competition' | 'Leadership' | 'Sports' | 'Cultural' | 'Community Service'
  title: string
  description: string
  year: number
  institution?: string
  level: 'School' | 'Provincial' | 'National' | 'International'
}

export interface CareerInterest {
  field: string
  specificCareer?: string
  motivationLevel: 1 | 2 | 3 | 4 | 5
  experienceLevel: 'None' | 'Some' | 'Moderate' | 'Extensive'
  relatedActivities: string[]
}

export interface DocumentCollection {
  // Identity Documents
  identityDocument: DocumentInfo
  passportPhoto: DocumentInfo
  
  // Academic Documents
  matricCertificate: DocumentInfo
  matricResults: DocumentInfo
  academicTranscripts: DocumentInfo[]
  
  // Financial Documents
  parentIncomeStatements: DocumentInfo[]
  bankStatements: DocumentInfo[]
  affidavitOfSupport?: DocumentInfo
  
  // Additional Documents
  medicalCertificate?: DocumentInfo
  policeClearance?: DocumentInfo
  motivationLetter?: DocumentInfo
  cv?: DocumentInfo
  portfolioDocuments: DocumentInfo[]
  
  // Verification Documents
  affidavits: DocumentInfo[]
  certifiedCopies: DocumentInfo[]
}

export interface DocumentInfo {
  id: string
  name: string
  type: DocumentType
  fileUrl: string
  uploadDate: string
  fileSize: number
  mimeType: string
  isVerified: boolean
  verificationDate?: string
  expiryDate?: string
  notes?: string
}

export type DocumentType = 
  | 'ID_DOCUMENT'
  | 'PASSPORT_PHOTO'
  | 'MATRIC_CERTIFICATE'
  | 'MATRIC_RESULTS'
  | 'ACADEMIC_TRANSCRIPT'
  | 'INCOME_STATEMENT'
  | 'BANK_STATEMENT'
  | 'AFFIDAVIT_SUPPORT'
  | 'MEDICAL_CERTIFICATE'
  | 'POLICE_CLEARANCE'
  | 'MOTIVATION_LETTER'
  | 'CV'
  | 'PORTFOLIO'
  | 'AFFIDAVIT'
  | 'CERTIFIED_COPY'
  | 'OTHER'

export interface StudentPreferences {
  // Study Preferences
  preferredFields: string[]
  preferredQualificationLevels: QualificationLevel[]
  preferredInstitutionTypes: InstitutionType[]
  preferredProvinces: string[]
  
  // Financial Preferences
  maxTuitionFee?: number
  needsFinancialAid: boolean
  interestedInBursaries: boolean
  interestedInLoans: boolean
  
  // Accommodation Preferences
  needsAccommodation: boolean
  accommodationType?: 'Residence' | 'Private' | 'Home'
  
  // Communication Preferences
  notificationPreferences: NotificationPreferences
}

export interface NotificationPreferences {
  applicationUpdates: boolean
  newOpportunities: boolean
  deadlineReminders: boolean
  bursaryAlerts: boolean
  weeklyDigest: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
}

export interface ApplicationReadiness {
  // Completeness Checks
  profileComplete: boolean
  documentsComplete: boolean
  academicInfoComplete: boolean
  contactInfoComplete: boolean
  
  // Verification Status
  identityVerified: boolean
  academicRecordsVerified: boolean
  documentsVerified: boolean
  
  // Application Eligibility
  eligibleForUniversity: boolean
  eligibleForTVET: boolean
  eligibleForBursaries: boolean
  
  // Missing Requirements
  missingDocuments: DocumentType[]
  missingInformation: string[]
  
  // Readiness Score
  readinessScore: number // 0-100%
  lastAssessment: string
}

export type EducationLevel = 
  | 'No Formal Education'
  | 'Primary School'
  | 'Grade 8-11'
  | 'Matric/Grade 12'
  | 'Certificate'
  | 'Diploma'
  | 'Degree'
  | 'Honours'
  | 'Masters'
  | 'Doctorate'

export type QualificationLevel = 
  | 'Certificate'
  | 'Diploma'
  | 'Advanced Diploma'
  | 'Bachelor\'s Degree'
  | 'Honours Degree'
  | 'Master\'s Degree'
  | 'Doctoral Degree'

export type InstitutionType = 
  | 'University'
  | 'University of Technology'
  | 'TVET College'
  | 'Private College'
  | 'Distance Learning'

export type HouseholdIncomeRange = 
  | 'R0 - R50,000'
  | 'R50,001 - R100,000'
  | 'R100,001 - R200,000'
  | 'R200,001 - R350,000'
  | 'R350,001 - R500,000'
  | 'R500,001+'
  | 'Prefer not to say'

// Validation and Helper Types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  completenessScore: number
}

export interface ValidationError {
  field: string
  message: string
  severity: 'Error' | 'Warning' | 'Info'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Profile Building Progress
export interface ProfileProgress {
  currentStep: ProfileStep
  completedSteps: ProfileStep[]
  totalSteps: number
  estimatedTimeRemaining: number // minutes
}

export type ProfileStep = 
  | 'PERSONAL_INFO'
  | 'CONTACT_INFO'
  | 'ACADEMIC_HISTORY'
  | 'DOCUMENT_UPLOAD'
  | 'PREFERENCES'
  | 'VERIFICATION'
  | 'REVIEW'
