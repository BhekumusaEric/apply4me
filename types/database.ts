export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          id_number: string | null
          province: string | null
          created_at: string
          updated_at: string
          role: 'student' | 'admin'
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          id_number?: string | null
          province?: string | null
          created_at?: string
          updated_at?: string
          role?: 'student' | 'admin'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          id_number?: string | null
          province?: string | null
          created_at?: string
          updated_at?: string
          role?: 'student' | 'admin'
        }
      }
      institutions: {
        Row: {
          id: string
          name: string
          type: 'university' | 'college' | 'tvet'
          province: string
          logo_url: string | null
          description: string
          application_deadline: string | null
          application_fee: number | null
          required_documents: string[]
          contact_email: string | null
          contact_phone: string | null
          website_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'university' | 'college' | 'tvet'
          province: string
          logo_url?: string | null
          description: string
          application_deadline?: string | null
          application_fee?: number | null
          required_documents?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'university' | 'college' | 'tvet'
          province?: string
          logo_url?: string | null
          description?: string
          application_deadline?: string | null
          application_fee?: number | null
          required_documents?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          institution_id: string
          name: string
          field_of_study: string
          qualification_level: string
          duration_years: number
          requirements: string[]
          career_outcomes: string[]
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          field_of_study: string
          qualification_level: string
          duration_years: number
          requirements?: string[]
          career_outcomes?: string[]
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          field_of_study?: string
          qualification_level?: string
          duration_years?: number
          requirements?: string[]
          career_outcomes?: string[]
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          institution_id: string
          program_id: string | null
          status: 'draft' | 'submitted' | 'processing' | 'completed'
          personal_details: Json
          academic_records: Json
          documents: Json
          payment_status: 'pending' | 'paid' | 'failed'
          payment_reference: string | null
          service_type: 'standard' | 'express'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution_id: string
          program_id?: string | null
          status?: 'draft' | 'submitted' | 'processing' | 'completed'
          personal_details?: Json
          academic_records?: Json
          documents?: Json
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_reference?: string | null
          service_type?: 'standard' | 'express'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution_id?: string
          program_id?: string | null
          status?: 'draft' | 'submitted' | 'processing' | 'completed'
          personal_details?: Json
          academic_records?: Json
          documents?: Json
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_reference?: string | null
          service_type?: 'standard' | 'express'
          created_at?: string
          updated_at?: string
        }
      }
      bursaries: {
        Row: {
          id: string
          name: string
          provider: string
          type: 'national' | 'provincial' | 'sector' | 'institutional'
          field_of_study: string[]
          eligibility_criteria: string[]
          amount: number | null
          application_deadline: string | null
          application_url: string | null
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          provider: string
          type: 'national' | 'provincial' | 'sector' | 'institutional'
          field_of_study?: string[]
          eligibility_criteria?: string[]
          amount?: number | null
          application_deadline?: string | null
          application_url?: string | null
          description: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider?: string
          type?: 'national' | 'provincial' | 'sector' | 'institutional'
          field_of_study?: string[]
          eligibility_criteria?: string[]
          amount?: number | null
          application_deadline?: string | null
          application_url?: string | null
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      career_profiles: {
        Row: {
          id: string
          user_id: string
          interests: string[]
          skills: string[]
          subjects: string[]
          work_preferences: string[]
          recommended_careers: string[]
          recommended_programs: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interests?: string[]
          skills?: string[]
          subjects?: string[]
          work_preferences?: string[]
          recommended_careers?: string[]
          recommended_programs?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interests?: string[]
          skills?: string[]
          subjects?: string[]
          work_preferences?: string[]
          recommended_careers?: string[]
          recommended_programs?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
