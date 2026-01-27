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

export type Lecturer = {
  id: string;
  name: string;
  nic: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_active: boolean;
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




export type UserRole = 'admin' | 'lecturer';
