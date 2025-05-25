import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatPhoneNumber(phone: string): string {
  // Format South African phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function validateSAIdNumber(idNumber: string): boolean {
  // Basic South African ID number validation
  if (idNumber.length !== 13) return false
  
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

export function getProvinces(): string[] {
  return [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ]
}

export function getInstitutionTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'university', label: 'University' },
    { value: 'college', label: 'College' },
    { value: 'tvet', label: 'TVET College' }
  ]
}

export function getFieldsOfStudy(): string[] {
  return [
    'Agriculture',
    'Arts and Humanities',
    'Business and Management',
    'Education',
    'Engineering and Technology',
    'Health Sciences',
    'Law',
    'Natural Sciences',
    'Social Sciences',
    'Theology'
  ]
}

export function generateApplicationReference(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `APP-${timestamp}-${random}`.toUpperCase()
}

export function calculateApplicationFee(serviceType: 'standard' | 'express'): number {
  return serviceType === 'express' ? 100 : 50
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}
