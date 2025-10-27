import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srorhhpjleehnudorsvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyb3JoaHBqbGVlaG51ZG9yc3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDMyNjYsImV4cCI6MjA2OTc3OTI2Nn0.9PLN1fDdhcRFpvBD9rTcV5f4lx9bV7nhVsOD_vwlTfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DocumentType = 'certificate' | 'offer_letter' | 'lor';

export interface Document {
  id: string;
  type: DocumentType;
  student_name: string;
  student_email: string;
  internship_domain: string;
  issue_date: string;
  status: 'valid' | 'revoked';
  pdf_url?: string;
  qr_code_url?: string;
  additional_fields?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
