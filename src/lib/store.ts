// Simple in-memory store with localStorage persistence for the school management system

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  guardianName: string;
  phone: string;
  email: string;
  address: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  phone: string;
  email: string;
  qualification: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface Staff {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface ClassConfig {
  id: string;
  name: string;
  sections: string[];
  classTeacher?: string;
}

export interface FeeStructure {
  id: string;
  className: string;
  feeType: string;
  amount: number;
  dueDate: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  paidDate: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  receiptNo: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'Event' | 'Holiday' | 'Exam';
  description: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  audience: 'All' | 'Students' | 'Teachers' | 'Parents';
  priority: 'Normal' | 'Important' | 'Urgent';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  section: string;
  records: { studentId: string; studentName: string; status: 'Present' | 'Absent' | 'Late' }[];
}

export interface Exam {
  id: string;
  name: string;
  className: string;
  date: string;
  subjects: string[];
  maxMarks: number;
  passMarks: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  marks: { subject: string; obtained: number; max: number }[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface RoutinePeriod {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNo: number;
  startTime: string;
  endTime: string;
  className: string;
  section: string;
  subject: string;
  teacherId: string;
  teacherName: string;
}

export interface PromotionPolicy {
  minPercentage: number;
  minAttendancePercent: number;
  requireAllSubjectsPass: boolean;
  minSubjectsPass: number;
}

const defaultPromotionPolicy: PromotionPolicy = {
  minPercentage: 40,
  minAttendancePercent: 75,
  requireAllSubjectsPass: false,
  minSubjectsPass: 0,
};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

// Seed data
const defaultClasses: ClassConfig[] = [
  { id: generateId(), name: 'Nursery', sections: ['A', 'B'] },
  { id: generateId(), name: 'LKG', sections: ['A', 'B'] },
  { id: generateId(), name: 'UKG', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 1', sections: ['A', 'B', 'C'] },
  { id: generateId(), name: 'Class 2', sections: ['A', 'B', 'C'] },
  { id: generateId(), name: 'Class 3', sections: ['A', 'B', 'C'] },
  { id: generateId(), name: 'Class 4', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 5', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 6', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 7', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 8', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 9', sections: ['A', 'B'] },
  { id: generateId(), name: 'Class 10', sections: ['A', 'B'] },
];

const sampleStudents: Student[] = [
  { id: generateId(), name: 'Aarav Sharma', rollNo: '1001', className: 'Class 5', section: 'A', gender: 'Male', dob: '2014-03-15', guardianName: 'Rajesh Sharma', phone: '9876543210', email: 'rajesh@email.com', address: '12 MG Road, City', admissionDate: '2020-04-01', status: 'Active' },
  { id: generateId(), name: 'Priya Patel', rollNo: '1002', className: 'Class 5', section: 'A', gender: 'Female', dob: '2014-06-22', guardianName: 'Sunil Patel', phone: '9876543211', email: 'sunil@email.com', address: '45 Park Street', admissionDate: '2020-04-01', status: 'Active' },
  { id: generateId(), name: 'Rohan Gupta', rollNo: '1003', className: 'Class 7', section: 'B', gender: 'Male', dob: '2012-11-08', guardianName: 'Amit Gupta', phone: '9876543212', email: 'amit@email.com', address: '78 Lake View', admissionDate: '2019-04-01', status: 'Active' },
  { id: generateId(), name: 'Sneha Reddy', rollNo: '1004', className: 'Class 3', section: 'A', gender: 'Female', dob: '2016-01-30', guardianName: 'Venkat Reddy', phone: '9876543213', email: 'venkat@email.com', address: '23 Hill Road', admissionDate: '2021-04-01', status: 'Active' },
  { id: generateId(), name: 'Kabir Singh', rollNo: '1005', className: 'Class 10', section: 'A', gender: 'Male', dob: '2009-07-14', guardianName: 'Harpreet Singh', phone: '9876543214', email: 'harpreet@email.com', address: '56 Garden Lane', admissionDate: '2018-04-01', status: 'Active' },
  { id: generateId(), name: 'Ananya Das', rollNo: '1006', className: 'Class 8', section: 'A', gender: 'Female', dob: '2011-09-25', guardianName: 'Bikram Das', phone: '9876543215', email: 'bikram@email.com', address: '90 River Road', admissionDate: '2019-04-01', status: 'Active' },
];

const sampleTeachers: Teacher[] = [
  { id: generateId(), name: 'Dr. Meera Nair', employeeId: 'T001', subject: 'Mathematics', phone: '9876501001', email: 'meera@school.com', qualification: 'Ph.D Mathematics', joinDate: '2015-06-01', status: 'Active' },
  { id: generateId(), name: 'Mr. Arjun Rao', employeeId: 'T002', subject: 'English', phone: '9876501002', email: 'arjun@school.com', qualification: 'M.A English', joinDate: '2016-04-01', status: 'Active' },
  { id: generateId(), name: 'Mrs. Sunita Verma', employeeId: 'T003', subject: 'Science', phone: '9876501003', email: 'sunita@school.com', qualification: 'M.Sc Physics', joinDate: '2017-07-15', status: 'Active' },
  { id: generateId(), name: 'Mr. Faiz Khan', employeeId: 'T004', subject: 'Social Studies', phone: '9876501004', email: 'faiz@school.com', qualification: 'M.A History', joinDate: '2018-04-01', status: 'Active' },
  { id: generateId(), name: 'Ms. Lakshmi Iyer', employeeId: 'T005', subject: 'Hindi', phone: '9876501005', email: 'lakshmi@school.com', qualification: 'M.A Hindi', joinDate: '2019-06-01', status: 'Active' },
];

const sampleStaff: Staff[] = [
  { id: generateId(), name: 'Mr. Ramesh Kumar', employeeId: 'S001', role: 'Office Administrator', department: 'Administration', phone: '9876502001', email: 'ramesh@school.com', joinDate: '2014-01-15', status: 'Active' },
  { id: generateId(), name: 'Mrs. Geeta Devi', employeeId: 'S002', role: 'Librarian', department: 'Library', phone: '9876502002', email: 'geeta@school.com', joinDate: '2016-03-01', status: 'Active' },
  { id: generateId(), name: 'Mr. Suresh Yadav', employeeId: 'S003', role: 'Lab Assistant', department: 'Science Lab', phone: '9876502003', email: 'suresh@school.com', joinDate: '2018-07-01', status: 'Active' },
];

const sampleFees: FeeStructure[] = [
  { id: generateId(), className: 'All Classes', feeType: 'Tuition Fee', amount: 5000, dueDate: '2025-04-10', frequency: 'Monthly' },
  { id: generateId(), className: 'All Classes', feeType: 'Annual Fee', amount: 15000, dueDate: '2025-04-01', frequency: 'Annually' },
  { id: generateId(), className: 'Class 9', feeType: 'Lab Fee', amount: 3000, dueDate: '2025-04-01', frequency: 'Annually' },
  { id: generateId(), className: 'Class 10', feeType: 'Lab Fee', amount: 3000, dueDate: '2025-04-01', frequency: 'Annually' },
];

const sampleEvents: Event[] = [
  { id: generateId(), title: 'Annual Sports Day', date: '2025-02-28', type: 'Event', description: 'Annual inter-house sports competition' },
  { id: generateId(), title: 'Republic Day', date: '2025-01-26', type: 'Holiday', description: 'National holiday' },
  { id: generateId(), title: 'Mid-Term Examination', date: '2025-03-10', type: 'Exam', description: 'Mid-term exams for all classes' },
  { id: generateId(), title: 'Holi', date: '2025-03-14', type: 'Holiday', description: 'Festival of colors' },
  { id: generateId(), title: 'Parent-Teacher Meeting', date: '2025-03-22', type: 'Event', description: 'PTM for Classes 1-10' },
];

const sampleNotices: Notice[] = [
  { id: generateId(), title: 'Uniform Guidelines Updated', content: 'All students must adhere to the updated uniform guidelines starting next month. Winter uniforms are mandatory from November.', date: '2025-02-10', audience: 'All', priority: 'Important' },
  { id: generateId(), title: 'Fee Payment Reminder', content: 'Parents are reminded to clear all pending fee dues before the end of this month to avoid late charges.', date: '2025-02-12', audience: 'Parents', priority: 'Urgent' },
  { id: generateId(), title: 'Staff Meeting', content: 'All teaching staff to attend the monthly review meeting in the conference hall.', date: '2025-02-14', audience: 'Teachers', priority: 'Normal' },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`school_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(`school_${key}`, JSON.stringify(data));
}

export const store = {
  getStudents: (): Student[] => load('students', sampleStudents),
  setStudents: (s: Student[]) => save('students', s),

  getTeachers: (): Teacher[] => load('teachers', sampleTeachers),
  setTeachers: (t: Teacher[]) => save('teachers', t),

  getStaff: (): Staff[] => load('staff', sampleStaff),
  setStaff: (s: Staff[]) => save('staff', s),

  getClasses: (): ClassConfig[] => load('classes', defaultClasses),
  setClasses: (c: ClassConfig[]) => save('classes', c),

  getFees: (): FeeStructure[] => load('fees', sampleFees),
  setFees: (f: FeeStructure[]) => save('fees', f),

  getFeePayments: (): FeePayment[] => load('feePayments', []),
  setFeePayments: (p: FeePayment[]) => save('feePayments', p),

  getEvents: (): Event[] => load('events', sampleEvents),
  setEvents: (e: Event[]) => save('events', e),

  getNotices: (): Notice[] => load('notices', sampleNotices),
  setNotices: (n: Notice[]) => save('notices', n),

  getAttendance: (): AttendanceRecord[] => load('attendance', []),
  setAttendance: (a: AttendanceRecord[]) => save('attendance', a),

  getExams: (): Exam[] => load('exams', []),
  setExams: (e: Exam[]) => save('exams', e),

  getExamResults: (): ExamResult[] => load('examResults', []),
  setExamResults: (r: ExamResult[]) => save('examResults', r),

  getRoutine: (): RoutinePeriod[] => load('routine', []),
  setRoutine: (r: RoutinePeriod[]) => save('routine', r),

  getPromotionPolicy: (): PromotionPolicy => load('promotionPolicy', defaultPromotionPolicy),
  setPromotionPolicy: (p: PromotionPolicy) => save('promotionPolicy', p),

  generateId,
};
