/**
 * Profile Validation Service
 * Validates student profiles for application readiness
 * Ensures all required data is present for SA higher education applications
 */

import {
  StudentProfile,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ApplicationReadiness,
  DocumentType
} from '@/lib/types/student-profile'

export class ProfileValidator {

  /**
   * Validate complete student profile
   */
  validateProfile(profile: StudentProfile): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate each section
    const personalInfoValidation = this.validatePersonalInfo(profile)
    const contactInfoValidation = this.validateContactInfo(profile)
    const academicValidation = this.validateAcademicHistory(profile)
    const documentsValidation = this.validateDocuments(profile)

    errors.push(...personalInfoValidation.errors)
    errors.push(...contactInfoValidation.errors)
    errors.push(...academicValidation.errors)
    errors.push(...documentsValidation.errors)

    warnings.push(...personalInfoValidation.warnings)
    warnings.push(...contactInfoValidation.warnings)
    warnings.push(...academicValidation.warnings)
    warnings.push(...documentsValidation.warnings)

    const completenessScore = this.calculateCompletenessScore(profile)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completenessScore
    }
  }

  /**
   * Validate personal information
   */
  private validatePersonalInfo(profile: StudentProfile): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!profile.personalInfo) {
      errors.push({ field: 'personalInfo', message: 'Personal information is required', severity: 'Error' })
      return { errors, warnings }
    }

    const personal = profile.personalInfo

    // Required fields
    if (!personal.idNumber) {
      errors.push({ field: 'personalInfo.idNumber', message: 'ID Number is required', severity: 'Error' })
    } else if (!this.validateSAIdNumber(personal.idNumber)) {
      errors.push({ field: 'personalInfo.idNumber', message: 'Invalid South African ID Number', severity: 'Error' })
    }

    if (!personal.firstName) {
      errors.push({ field: 'personalInfo.firstName', message: 'First name is required', severity: 'Error' })
    }

    if (!personal.lastName) {
      errors.push({ field: 'personalInfo.lastName', message: 'Last name is required', severity: 'Error' })
    }

    if (!personal.dateOfBirth) {
      errors.push({ field: 'personalInfo.dateOfBirth', message: 'Date of birth is required', severity: 'Error' })
    }

    if (!personal.homeLanguage) {
      errors.push({ field: 'personalInfo.homeLanguage', message: 'Home language is required', severity: 'Error' })
    }

    if (!personal.currentProvince) {
      errors.push({ field: 'personalInfo.currentProvince', message: 'Current province is required', severity: 'Error' })
    }

    // Parent/Guardian information
    if (!personal.parentGuardianInfo || personal.parentGuardianInfo.length === 0) {
      errors.push({ field: 'personalInfo.parentGuardianInfo', message: 'At least one parent/guardian is required', severity: 'Error' })
    } else {
      personal.parentGuardianInfo.forEach((parent, index) => {
        if (!parent.name) {
          errors.push({ field: `personalInfo.parentGuardianInfo[${index}].name`, message: `Parent/Guardian ${index + 1} name is required`, severity: 'Error' })
        }
        if (!parent.phone) {
          errors.push({ field: `personalInfo.parentGuardianInfo[${index}].phone`, message: `Parent/Guardian ${index + 1} phone is required`, severity: 'Error' })
        }
        if (!parent.occupation) {
          errors.push({ field: `personalInfo.parentGuardianInfo[${index}].occupation`, message: `Parent/Guardian ${index + 1} occupation is required`, severity: 'Error' })
        }
      })
    }

    // Warnings for optional but recommended fields
    if (!personal.middleName) {
      warnings.push({
        field: 'personalInfo.middleName',
        message: 'Middle name not provided',
        suggestion: 'Consider adding middle name if it appears on official documents'
      })
    }

    if (personal.race === 'Prefer not to say') {
      warnings.push({
        field: 'personalInfo.race',
        message: 'Race not specified',
        suggestion: 'Specifying race may be required for BBBEE and funding applications'
      })
    }

    return { errors, warnings }
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(profile: StudentProfile): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!profile.contactInfo) {
      errors.push({ field: 'contactInfo', message: 'Contact information is required', severity: 'Error' })
      return { errors, warnings }
    }

    const contact = profile.contactInfo

    // Required fields
    if (!contact.email) {
      errors.push({ field: 'contactInfo.email', message: 'Email address is required', severity: 'Error' })
    } else if (!this.validateEmail(contact.email)) {
      errors.push({ field: 'contactInfo.email', message: 'Invalid email address format', severity: 'Error' })
    }

    if (!contact.phone) {
      errors.push({ field: 'contactInfo.phone', message: 'Phone number is required', severity: 'Error' })
    } else if (!this.validateSAPhoneNumber(contact.phone)) {
      errors.push({ field: 'contactInfo.phone', message: 'Invalid South African phone number', severity: 'Error' })
    }

    // Address validation
    if (!contact.currentAddress) {
      errors.push({ field: 'contactInfo.currentAddress', message: 'Current address is required', severity: 'Error' })
    } else {
      const address = contact.currentAddress
      if (!address.streetAddress) errors.push({ field: 'contactInfo.currentAddress.streetAddress', message: 'Street address is required', severity: 'Error' })
      if (!address.city) errors.push({ field: 'contactInfo.currentAddress.city', message: 'City is required', severity: 'Error' })
      if (!address.province) errors.push({ field: 'contactInfo.currentAddress.province', message: 'Province is required', severity: 'Error' })
      if (!address.postalCode) errors.push({ field: 'contactInfo.currentAddress.postalCode', message: 'Postal code is required', severity: 'Error' })
    }

    // Emergency contact
    if (!contact.emergencyContact) {
      errors.push({ field: 'contactInfo.emergencyContact', message: 'Emergency contact is required', severity: 'Error' })
    } else {
      const emergency = contact.emergencyContact
      if (!emergency.name) errors.push({ field: 'contactInfo.emergencyContact.name', message: 'Emergency contact name is required', severity: 'Error' })
      if (!emergency.phone) errors.push({ field: 'contactInfo.emergencyContact.phone', message: 'Emergency contact phone is required', severity: 'Error' })
      if (!emergency.relationship) errors.push({ field: 'contactInfo.emergencyContact.relationship', message: 'Emergency contact relationship is required', severity: 'Error' })
    }

    return { errors, warnings }
  }

  /**
   * Validate academic history
   */
  private validateAcademicHistory(profile: StudentProfile): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!profile.academicHistory) {
      errors.push({ field: 'academicHistory', message: 'Academic history is required', severity: 'Error' })
      return { errors, warnings }
    }

    const academic = profile.academicHistory

    // Matric information is required
    if (!academic.matricInfo) {
      errors.push({ field: 'academicHistory.matricInfo', message: 'Matric information is required', severity: 'Error' })
    } else {
      const matric = academic.matricInfo
      if (!matric.year) errors.push({ field: 'academicHistory.matricInfo.year', message: 'Matric year is required', severity: 'Error' })
      if (!matric.school) errors.push({ field: 'academicHistory.matricInfo.school', message: 'School name is required', severity: 'Error' })
      if (!matric.overallResult) errors.push({ field: 'academicHistory.matricInfo.overallResult', message: 'Matric result is required', severity: 'Error' })

      // Subject validation
      if (!matric.subjects || matric.subjects.length === 0) {
        errors.push({ field: 'academicHistory.matricInfo.subjects', message: 'Matric subjects are required', severity: 'Error' })
      } else {
        // Check for required subjects
        const hasLanguage = matric.subjects.some(s => s.isLanguage && s.mark >= 40)
        const hasMaths = matric.subjects.some(s => s.isMathematics && s.mark >= 30)

        if (!hasLanguage) {
          errors.push({ field: 'academicHistory.matricInfo.subjects', message: 'At least one language with 40%+ is required', severity: 'Error' })
        }

        if (!hasMaths) {
          warnings.push({
            field: 'academicHistory.matricInfo.subjects',
            message: 'No mathematics subject found',
            suggestion: 'Mathematics or Mathematical Literacy is required for most programs'
          })
        }
      }
    }

    return { errors, warnings }
  }

  /**
   * Validate documents
   */
  private validateDocuments(profile: StudentProfile): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!profile.documents) {
      errors.push({ field: 'documents', message: 'Documents are required', severity: 'Error' })
      return { errors, warnings }
    }

    const docs = profile.documents

    // Required documents
    const requiredDocs: { field: keyof typeof docs, name: string }[] = [
      { field: 'identityDocument', name: 'ID Document' },
      { field: 'passportPhoto', name: 'Passport Photo' },
      { field: 'matricCertificate', name: 'Matric Certificate' },
      { field: 'matricResults', name: 'Matric Results' }
    ]

    requiredDocs.forEach(({ field, name }) => {
      const doc = docs[field] as any
      if (!doc || !doc.fileUrl) {
        errors.push({ field: `documents.${field}`, message: `${name} is required`, severity: 'Error' })
      }
    })

    // Income statements required for financial aid
    if (!docs.parentIncomeStatements || docs.parentIncomeStatements.length === 0) {
      errors.push({ field: 'documents.parentIncomeStatements', message: 'Parent/Guardian income statements are required', severity: 'Error' })
    }

    // Warnings for recommended documents
    if (!docs.bankStatements || docs.bankStatements.length === 0) {
      warnings.push({
        field: 'documents.bankStatements',
        message: 'Bank statements not provided',
        suggestion: 'Bank statements may be required for financial aid applications'
      })
    }

    return { errors, warnings }
  }

  /**
   * Calculate profile completeness score
   */
  private calculateCompletenessScore(profile: StudentProfile): number {
    let totalPoints = 0
    let earnedPoints = 0

    // Personal Info (30 points)
    totalPoints += 30
    if (profile.personalInfo) {
      if (profile.personalInfo.idNumber) earnedPoints += 5
      if (profile.personalInfo.firstName) earnedPoints += 3
      if (profile.personalInfo.lastName) earnedPoints += 3
      if (profile.personalInfo.dateOfBirth) earnedPoints += 2
      if (profile.personalInfo.homeLanguage) earnedPoints += 2
      if (profile.personalInfo.currentProvince) earnedPoints += 2
      if (profile.personalInfo.parentGuardianInfo?.length > 0) earnedPoints += 8
      if (profile.personalInfo.householdIncome !== 'Prefer not to say') earnedPoints += 3
      if (profile.personalInfo.race !== 'Prefer not to say') earnedPoints += 2
    }

    // Contact Info (20 points)
    totalPoints += 20
    if (profile.contactInfo) {
      if (profile.contactInfo.email) earnedPoints += 5
      if (profile.contactInfo.phone) earnedPoints += 5
      if (profile.contactInfo.currentAddress) earnedPoints += 5
      if (profile.contactInfo.emergencyContact) earnedPoints += 5
    }

    // Academic History (25 points)
    totalPoints += 25
    if (profile.academicHistory?.matricInfo) {
      if (profile.academicHistory.matricInfo.year) earnedPoints += 3
      if (profile.academicHistory.matricInfo.school) earnedPoints += 3
      if (profile.academicHistory.matricInfo.overallResult) earnedPoints += 5
      if (profile.academicHistory.matricInfo.subjects?.length > 0) earnedPoints += 10
      if (profile.academicHistory.matricInfo.apsScore) earnedPoints += 4
    }

    // Documents (25 points)
    totalPoints += 25
    if (profile.documents) {
      if ((profile.documents.identityDocument as any)?.fileUrl) earnedPoints += 6
      if ((profile.documents.passportPhoto as any)?.fileUrl) earnedPoints += 4
      if ((profile.documents.matricCertificate as any)?.fileUrl) earnedPoints += 6
      if ((profile.documents.matricResults as any)?.fileUrl) earnedPoints += 6
      if (profile.documents.parentIncomeStatements?.length > 0) earnedPoints += 3
    }

    return Math.round((earnedPoints / totalPoints) * 100)
  }

  /**
   * Generate application readiness assessment
   */
  generateApplicationReadiness(profile: StudentProfile): ApplicationReadiness {
    const validation = this.validateProfile(profile)

    const missingDocuments: DocumentType[] = []
    const missingInformation: string[] = []

    // Check for missing required documents
    if (!profile.documents) {
      missingDocuments.push('ID_DOCUMENT', 'PASSPORT_PHOTO', 'MATRIC_CERTIFICATE', 'MATRIC_RESULTS')
    } else {
      if (!(profile.documents.identityDocument as any)?.fileUrl) missingDocuments.push('ID_DOCUMENT')
      if (!(profile.documents.passportPhoto as any)?.fileUrl) missingDocuments.push('PASSPORT_PHOTO')
      if (!(profile.documents.matricCertificate as any)?.fileUrl) missingDocuments.push('MATRIC_CERTIFICATE')
      if (!(profile.documents.matricResults as any)?.fileUrl) missingDocuments.push('MATRIC_RESULTS')
      if (!profile.documents.parentIncomeStatements?.length) missingDocuments.push('INCOME_STATEMENT')
    }

    // Check for missing information
    validation.errors.forEach(error => {
      if (!missingInformation.includes(error.message)) {
        missingInformation.push(error.message)
      }
    })

    // Determine eligibility
    const hasMatricPass = profile.academicHistory?.matricInfo?.overallResult === 'Bachelor Pass' ||
                         profile.academicHistory?.matricInfo?.overallResult === 'Diploma Pass'

    const eligibleForUniversity = hasMatricPass &&
                                 profile.academicHistory?.matricInfo?.overallResult === 'Bachelor Pass'

    const eligibleForTVET = hasMatricPass ||
                           profile.academicHistory?.matricInfo?.overallResult === 'Higher Certificate Pass'

    return {
      profileComplete: validation.completenessScore >= 90,
      documentsComplete: missingDocuments.length === 0,
      academicInfoComplete: !!profile.academicHistory?.matricInfo,
      contactInfoComplete: !!profile.contactInfo?.email && !!profile.contactInfo?.phone,
      identityVerified: false, // Would be set by verification process
      academicRecordsVerified: false, // Would be set by verification process
      documentsVerified: false, // Would be set by verification process
      eligibleForUniversity,
      eligibleForTVET,
      eligibleForBursaries: true, // Most students are eligible for some bursaries
      missingDocuments,
      missingInformation,
      readinessScore: validation.completenessScore,
      lastAssessment: new Date().toISOString()
    }
  }

  /**
   * Validate South African ID Number
   */
  private validateSAIdNumber(idNumber: string): boolean {
    if (idNumber.length !== 13) return false
    if (!/^\d{13}$/.test(idNumber)) return false

    // Luhn algorithm check
    const digits = idNumber.split('').map(Number)
    let sum = 0
    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i]
      } else {
        const doubled = digits[i] * 2
        sum += doubled > 9 ? doubled - 9 : doubled
      }
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[12]
  }

  /**
   * Validate email address
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate South African phone number
   */
  private validateSAPhoneNumber(phone: string): boolean {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

    // Check for valid SA phone number patterns
    const patterns = [
      /^0[1-9]\d{8}$/, // Landline: 0XX XXXX XXXX
      /^0[6-8]\d{8}$/, // Mobile: 06X/07X/08X XXXX XXXX
      /^\+27[1-9]\d{8}$/, // International: +27 XX XXXX XXXX
      /^27[1-9]\d{8}$/ // International without +: 27 XX XXXX XXXX
    ]

    return patterns.some(pattern => pattern.test(cleanPhone))
  }

  /**
   * Get application readiness recommendations
   */
  getRecommendations(profile: StudentProfile): string[] {
    const recommendations: string[] = []
    const readiness = this.generateApplicationReadiness(profile)

    if (!readiness.profileComplete) {
      recommendations.push('Complete your profile to enable automatic applications')
    }

    if (!readiness.documentsComplete) {
      recommendations.push('Upload all required documents for faster processing')
    }

    if (!readiness.eligibleForUniversity && readiness.eligibleForTVET) {
      recommendations.push('Consider TVET College programs - great career opportunities available')
    }

    if (readiness.eligibleForBursaries) {
      recommendations.push('Apply for bursaries early - funding is limited and competitive')
    }

    if (readiness.readinessScore < 70) {
      recommendations.push('Improve your profile completeness to unlock more opportunities')
    }

    return recommendations
  }
}
