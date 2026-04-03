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
  { id: '1', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: true, buildingId: '2' },
  { id: '2', subject: 'Computer Networks', time: '10:30 AM', room: 'CS-203', faculty: 'Prof. Suresh K', done: true, buildingId: '2' },
  { id: '3', subject: 'Operating Systems', time: '12:00 PM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false, current: true, buildingId: '2' },
  { id: '4', subject: 'Machine Learning Lab', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false, buildingId: '2' },
  { id: '5', subject: 'Web Technologies', time: '3:30 PM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false, buildingId: '2' },
];

export const mockTimetable: Record<string, typeof mockClasses> = {
  Mon: [
    { id: '1', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: false, buildingId: '2' },
    { id: '2', subject: 'Computer Networks', time: '10:30 AM', room: 'CS-203', faculty: 'Prof. Suresh K', done: false, buildingId: '2' },
    { id: '3', subject: 'Machine Learning', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false, buildingId: '2' },
  ],
  Tue: [
    { id: '4', subject: 'Operating Systems', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false, buildingId: '2' },
    { id: '5', subject: 'Web Technologies', time: '11:00 AM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false, buildingId: '2' },
  ],
  Wed: [
    { id: '6', subject: 'Data Structures', time: '9:00 AM', room: 'CS-101', faculty: 'Dr. Meera Iyer', done: false, buildingId: '2' },
    { id: '7', subject: 'Computer Networks Lab', time: '2:00 PM', room: 'Net-Lab', faculty: 'Prof. Suresh K', done: false, buildingId: '2' },
    { id: '8', subject: 'Machine Learning', time: '4:00 PM', room: 'CS-203', faculty: 'Prof. Rajan P', done: false, buildingId: '2' },
  ],
  Thu: [
    { id: '9', subject: 'Operating Systems', time: '10:30 AM', room: 'CS-101', faculty: 'Dr. Anita Rao', done: false, buildingId: '2' },
    { id: '10', subject: 'Web Technologies', time: '12:00 PM', room: 'CS-204', faculty: 'Dr. Kavya S', done: false, buildingId: '2' },
  ],
  Fri: [
    { id: '11', subject: 'Data Structures Lab', time: '9:00 AM', room: 'DS-Lab', faculty: 'Dr. Meera Iyer', done: false, buildingId: '2' },
    { id: '12', subject: 'Machine Learning', time: '2:00 PM', room: 'ML-Lab', faculty: 'Prof. Rajan P', done: false, buildingId: '2' },
  ],
  Sat: [
    { id: '13', subject: 'Mini Project', time: '10:00 AM', room: 'CS-203', faculty: 'Dr. Anita Rao', done: false, buildingId: '2' },
  ],
};

export const mockExamInternalsTimetable = [
  {
    id: 'ei-1',
    title: 'Data Structures Internal - 1',
    date: 'Apr 8, 2026',
    startDate: '2026-04-08T09:30:00',
    time: '9:30 AM - 10:30 AM',
    venue: 'CS-101',
    buildingId: '2',
    type: 'Internal',
  },
  {
    id: 'ei-2',
    title: 'Operating Systems Internal - 1',
    date: 'Apr 10, 2026',
    startDate: '2026-04-10T11:00:00',
    time: '11:00 AM - 12:00 PM',
    venue: 'CS-102',
    buildingId: '2',
    type: 'Internal',
  },
  {
    id: 'ei-3',
    title: 'Computer Networks Mid-Sem Exam',
    date: 'Apr 18, 2026',
    startDate: '2026-04-18T14:00:00',
    time: '2:00 PM - 5:00 PM',
    venue: 'Main Block Hall 2',
    buildingId: '1',
    type: 'Exam',
  },
  {
    id: 'ei-4',
    title: 'Machine Learning Mid-Sem Exam',
    date: 'Apr 21, 2026',
    startDate: '2026-04-21T09:30:00',
    time: '9:30 AM - 12:30 PM',
    venue: 'Main Block Hall 1',
    buildingId: '1',
    type: 'Exam',
  },
];

export const mockEvents = [
  {
    id: '1', title: 'Hackathon 2026', category: 'Technical',
    date: 'Apr 10-11, 2026', startDate: '2026-04-10T09:00:00', registrationCloses: '2026-04-08T23:59:00', time: '9:00 AM', venue: 'Main Auditorium', venueBuildingId: '7',
    organizer: 'CSE Dept', description: 'Annual 24-hour hackathon. Build innovative solutions for real-world problems. Prizes worth ₹1,00,000!',
    color: '#1A3C6E', registered: true, seats: '200 seats',
  },
  {
    id: '2', title: 'Revels Cultural Fest', category: 'Cultural',
    date: 'Apr 18-20, 2026', startDate: '2026-04-18T10:00:00', registrationCloses: '2026-04-16T23:59:00', time: '10:00 AM', venue: 'Open Air Theatre', venueBuildingId: '7',
    organizer: 'Student Council', description: 'RVU\'s biggest cultural extravaganza with music, dance, drama and more!',
    color: '#8B5CF6', registered: false, seats: '500 seats',
  },
  {
    id: '3', title: 'IEEE Tech Talk', category: 'Workshop',
    date: 'Apr 5, 2026', startDate: '2026-04-05T14:00:00', registrationCloses: '2026-04-04T18:00:00', time: '2:00 PM', venue: 'Seminar Hall A', venueBuildingId: '1',
    organizer: 'IEEE Student Branch', description: 'Guest lecture on AI & Future of Computing by industry experts from Google.',
    color: '#10B981', registered: true, seats: '100 seats',
  },
  {
    id: '4', title: 'Startup Pitch Day', category: 'Technical',
    date: 'Apr 22, 2026', startDate: '2026-04-22T11:00:00', registrationCloses: '2026-04-18T23:59:00', time: '11:00 AM', venue: 'Innovation Hub', venueBuildingId: '1',
    organizer: 'E-Cell RVU', description: 'Present your startup idea to investors and industry mentors. Win seed funding!',
    color: '#F4A020', registered: false, seats: '50 teams',
  },
  {
    id: '5', title: 'Sports Meet 2026', category: 'Sports',
    date: 'Apr 25-27, 2026', startDate: '2026-04-25T08:00:00', registrationCloses: '2026-04-20T23:59:00', time: '8:00 AM', venue: 'Sports Complex', venueBuildingId: '6',
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
  {
    id: '1',
    title: 'Mid-Semester Exam Schedule Released',
    body: 'The timetable for mid-semester exams has been published. Check your schedule carefully.',
    time: '2 hours ago',
    type: 'exam',
    unread: true,
    actionLabel: 'Open timetable',
    targetScreen: 'Timetable',
    targetParams: { highlightExamId: 'ei-1' },
  },
  {
    id: '2',
    title: 'Hackathon 2026 - Registrations Open',
    body: 'RVU annual hackathon is back. Register your team before April 8th.',
    time: '5 hours ago',
    type: 'event',
    unread: true,
    actionLabel: 'View event',
    targetScreen: 'Events',
    targetParams: { highlightEventId: '1', initialFilter: 'Technical' },
  },
  {
    id: '3',
    title: 'Library Timings Updated',
    body: 'The central library will now be open until 9 PM on weekdays starting April 1st.',
    time: 'Yesterday',
    type: 'general',
    unread: false,
    actionLabel: 'Open map',
    targetScreen: 'Map',
    targetParams: { focusBuildingId: '3' },
  },
  {
    id: '4',
    title: 'Fee Payment Deadline',
    body: 'Last date for semester fee payment is April 15th. Avoid late fine.',
    time: '2 days ago',
    type: 'important',
    unread: false,
    actionLabel: 'View profile',
    targetScreen: 'Profile',
  },
];
