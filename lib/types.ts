export type Department = {
  id: string;
  name: string;
  type: 'full-time' | 'part-time' | 'special';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Class = {
  id: string;
  name: string;
  department_id: string;
  default_strength: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};


export type TimeSlot = {
  id: string;
  slot_number: number;
  start_time: string;
  end_time: string;
};

export type Timetable = {
  id: string;
  day_of_week: number; // 0 = Sunday, 5 = Friday
  class_id: string;
  subject_id: string;
  lecturer_id: string;
  time_slot_id: string;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: string;
  name: string;
  nic: string | null;
  phone: string | null;
  address: string | null;
  class_id: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_nic: string | null;
  admission_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Attendance = {
  id: string;
  timetable_id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'left_early';
  marked_by: string;
  marked_at: string;
  created_at: string;
  updated_at: string;
};


// lib/types.ts

export interface Lecturer {
  lecturer_id: number
  admission_no: string | null
  admission_date: string | null
  full_name: string
  name_with_initial: string | null
  date_of_birth: string | null
  nic_no: string | null
  address: string | null
  district: string | null
  city: string | null
  mobile: string | null
  whatsapp: string | null
  date_of_appointment: string | null
  age_at_appointment: number | null
  appointment_post: string | null
  madrasa_name: string | null
  madrasa_address: string | null
  passed_out_year: number | null
  certificate_no: string | null
  other_skills: string | null
  remarks: string | null
  signature_name: string | null
  record_created_at: string
  // Related data
  qualifications?: LecturerQualification[]
  languages?: LecturerLanguage[]
}

export interface LecturerQualification {
  qualification_id: number
  lecturer_id: number
  degree_name: string
  year_completed: number | null
  institute_name: string | null
}

export interface LecturerLanguage {
  language_id: number
  lecturer_id: number
  language_name: string
  proficiency_level: string | null
}

export interface CreateLecturerInput {
  admission_no?: string
  admission_date?: string
  full_name: string
  name_with_initial?: string
  date_of_birth?: string
  nic_no?: string
  address?: string
  district?: string
  city?: string
  mobile?: string
  whatsapp?: string
  date_of_appointment?: string
  age_at_appointment?: number
  appointment_post?: string
  madrasa_name?: string
  madrasa_address?: string
  passed_out_year?: number
  certificate_no?: string
  other_skills?: string
  remarks?: string
  signature_name?: string
  qualifications?: Omit<LecturerQualification, 'qualification_id' | 'lecturer_id'>[]
  languages?: Omit<LecturerLanguage, 'language_id' | 'lecturer_id'>[]
}


export type UserRole = 'admin' | 'lecturer';
