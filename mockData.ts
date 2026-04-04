// Updated: 2026-04-05
export const mockUser = {
  name: 'Ananya Ravikumar',
  usn: '1RV21CS045',
  branch: 'Computer Science & Engineering',
  semester: '6th Semester',
  year: '3rd Year',
  section: 'C',
  phone: '+91 98765 43210',
  email: 'ananya.rv21cs045@rvce.edu.in',
  avatar: 'AR',
  dob: '12 March 2003',
  hostel: 'Day Scholar',
};

export const mockStats = [
  { label: 'Attendance', value: '84%', color: '#10B981' },
  { label: 'CGPA', value: '8.7', color: '#1A3C6E' },
  { label: 'Credits', value: '142', color: '#F4A020' },
  { label: 'Backlogs', value: '0', color: '#10B981' },
];

export const mockAttendance = [
  { subject: 'Data Structures', attended: 38, total: 45, color: '#1A3C6E' },
  { subject: 'Computer Networks', attended: 30, total: 40, color: '#10B981' },
  { subject: 'Operating Systems', attended: 22, total: 38, color: '#F59E0B' },
  { subject: 'Machine Learning', attended: 35, total: 36, color: '#8B5CF6' },
  { subject: 'Web Technologies', attended: 18, total: 30, color: '#EF4444' },
];

export const mockClasses = [
  { id: '1', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: true },
  { id: '2', subject: 'Computer Networks', time: '10:30 AM', room: 'CS-203', faculty: 'Prof. Suresh K', done: true },
  { id: '3', subject: 'Operating Systems', time: '12:00 PM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false, current: true },
  { id: '4', subject: 'Machine Learning Lab', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false },
  { id: '5', subject: 'Web Technologies', time: '3:30 PM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false },
];

export const mockTimetable: Record<string, typeof mockClasses> = {
  Mon: [
    { id: '1', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: false },
    { id: '2', subject: 'Computer Networks', time: '10:30 AM', room: 'CS-203', faculty: 'Prof. Suresh K', done: false },
    { id: '3', subject: 'Machine Learning', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false },
  ],
  Tue: [
    { id: '4', subject: 'Operating Systems', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false },
    { id: '5', subject: 'Web Technologies', time: '11:00 AM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false },
  ],
  Wed: [
    { id: '6', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: false },
    { id: '7', subject: 'Computer Networks Lab', time: '2:00 PM', room: 'Net-Lab', faculty: 'Prof. Suresh K', done: false },
    { id: '8', subject: 'Machine Learning', time: '4:00 PM', room: 'CS-203', faculty: 'Prof. Rajan P', done: false },
  ],
  Thu: [
    { id: '9', subject: 'Operating Systems', time: '10:30 AM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false },
    { id: '10', subject: 'Web Technologies', time: '12:00 PM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false },
  ],
  Fri: [
    { id: '11', subject: 'Data Structures Lab', time: '9:00 AM', room: 'DS-Lab', faculty: 'Dr. Meera Iyer', done: false },
    { id: '12', subject: 'Machine Learning', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false },
  ],
  Sat: [
    { id: '13', subject: 'Mini Project', time: '10:00 AM', room: 'CS-203', faculty: 'Dr. Anita Rao', done: false },
  ],
};

export const mockExamInternalsTimetable = [
  {
    id: 'ei-1',
    title: 'Data Structures Internal - 1',
    date: 'Apr 8, 2026',
    time: '9:30 AM - 10:30 AM',
    venue: 'CS-101',
    type: 'Internal',
  },
  {
    id: 'ei-2',
    title: 'Operating Systems Internal - 1',
    date: 'Apr 10, 2026',
    time: '11:00 AM - 12:00 PM',
    venue: 'CS-102',
    type: 'Internal',
  },
  {
    id: 'ei-3',
    title: 'Computer Networks Mid-Sem Exam',
    date: 'Apr 18, 2026',
    time: '2:00 PM - 5:00 PM',
    venue: 'Main Block Hall 2',
    type: 'Exam',
  },
  {
    id: 'ei-4',
    title: 'Machine Learning Mid-Sem Exam',
    date: 'Apr 21, 2026',
    time: '9:30 AM - 12:30 PM',
    venue: 'Main Block Hall 1',
    type: 'Exam',
  },
];

export const mockEvents = [
  {
    id: '1', title: 'Hackathon 2025', category: 'Technical',
    date: 'Apr 10–11, 2025', time: '9:00 AM', venue: 'Main Auditorium',
    organizer: 'CSE Dept', description: 'Annual 24-hour hackathon. Build innovative solutions for real-world problems. Prizes worth ₹1,00,000!',
    color: '#1A3C6E', registered: true, seats: '200 seats',
  },
  {
    id: '2', title: 'Revels Cultural Fest', category: 'Cultural',
    date: 'Apr 18–20, 2025', time: '10:00 AM', venue: 'Open Air Theatre',
    organizer: 'Student Council', description: 'RVU\'s biggest cultural extravaganza with music, dance, drama and more!',
    color: '#8B5CF6', registered: false, seats: '500 seats',
  },
  {
    id: '3', title: 'IEEE Tech Talk', category: 'Workshop',
    date: 'Apr 5, 2025', time: '2:00 PM', venue: 'Seminar Hall A',
    organizer: 'IEEE Student Branch', description: 'Guest lecture on AI & Future of Computing by industry experts from Google.',
    color: '#10B981', registered: true, seats: '100 seats',
  },
  {
    id: '4', title: 'Startup Pitch Day', category: 'Technical',
    date: 'Apr 22, 2025', time: '11:00 AM', venue: 'Innovation Hub',
    organizer: 'E-Cell RVU', description: 'Present your startup idea to investors and industry mentors. Win seed funding!',
    color: '#F4A020', registered: false, seats: '50 teams',
  },
  {
    id: '5', title: 'Sports Meet 2025', category: 'Sports',
    date: 'Apr 25–27, 2025', time: '8:00 AM', venue: 'Sports Complex',
    organizer: 'Sports Dept', description: 'Inter-department sports competition. Cricket, Football, Basketball and more.',
    color: '#EF4444', registered: false, seats: 'Open',
  },
];

export const mockClubs = [
  { id: '1', name: 'IEEE Student Branch', members: 120, category: 'Technical', emoji: '⚡', color: '#1A3C6E' },
  { id: '2', name: 'E-Cell RVU', members: 85, category: 'Entrepreneurship', emoji: '🚀', color: '#F4A020' },
  { id: '3', name: 'NSS Unit', members: 200, category: 'Social', emoji: '🌱', color: '#10B981' },
  { id: '4', name: 'Music Club', members: 60, category: 'Cultural', emoji: '🎵', color: '#8B5CF6' },
  { id: '5', name: 'Photography Club', members: 45, category: 'Creative', emoji: '📸', color: '#EF4444' },
  { id: '6', name: 'Coding Club', members: 150, category: 'Technical', emoji: '💻', color: '#3B82F6' },
];

export const mockAnnouncements = [
  { id: '1', title: 'Mid-Semester Exam Schedule Released', body: 'The timetable for mid-semester exams has been published. Check your schedule carefully.', time: '2 hours ago', type: 'exam', unread: true },
  { id: '2', title: 'Hackathon 2025 — Registrations Open', body: 'RVU annual hackathon is back! Register your team before April 5th.', time: '5 hours ago', type: 'event', unread: true },
  { id: '3', title: 'Library Timings Updated', body: 'The central library will now be open until 9 PM on weekdays starting April 1st.', time: 'Yesterday', type: 'general', unread: false },
  { id: '4', title: 'Fee Payment Deadline', body: 'Last date for semester fee payment is April 15th. Avoid late fine.', time: '2 days ago', type: 'important', unread: false },
];
