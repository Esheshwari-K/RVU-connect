// Firebase data types and fetching functions
import { firebaseFirestore, firebaseAuth } from '../firebase/firebase';
import { mockAttendance, mockAnnouncements, mockClubs, mockEvents, mockStats, mockTimetable, mockUser } from '../data/mockData';

export interface UserProfile {
  name: string;
  usn: string;
  branch: string;
  semester: string;
  year: string;
  section: string;
  phone: string;
  email: string;
  avatar: string;
  dob: string;
  hostel: string;
}

export interface AttendanceRecord {
  subject: string;
  attended: number;
  total: number;
  color: string;
}

export interface ClassItem {
  id: string;
  subject: string;
  time: string;
  room: string;
  faculty: string;
  done?: boolean;
  current?: boolean;
  buildingId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  color: string;
  registered: boolean;
  seats: string;
  startDate?: string;
  registrationCloses?: string;
  venueBuildingId?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: string;
  unread: boolean;
}

export interface ClubItem {
  id: string;
  name: string;
  members: number;
  category: string;
  emoji: string;
  color: string;
}

export interface StatsItem {
  label: string;
  value: string;
  color: string;
}

// Fetch user profile from Firestore
export async function fetchUserProfile(): Promise<UserProfile> {
  const user = firebaseAuth.currentUser;
  if (!user) return mockUser;

  try {
    const doc = await firebaseFirestore.collection('users').doc(user.uid).get();
    if (!doc.exists) return mockUser;
    const data = doc.data();
    return (data ?? mockUser) as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return mockUser;
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return { ...mockUser, ...profile } as UserProfile;
  }

  try {
    await firebaseFirestore.collection('users').doc(user.uid).update(profile);
    const updated = await fetchUserProfile();
    return updated;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { ...mockUser, ...profile } as UserProfile;
  }
}

// Fetch attendance records for current user
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const user = firebaseAuth.currentUser;
  if (!user) return mockAttendance;

  try {
    const snapshot = await firebaseFirestore
      .collection('users')
      .doc(user.uid)
      .collection('attendance')
      .get();

    return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return mockAttendance;
  }
}

// Fetch user stats
export async function fetchUserStats(): Promise<StatsItem[]> {
  const user = firebaseAuth.currentUser;
  if (!user) return mockStats;

  try {
    const doc = await firebaseFirestore.collection('users').doc(user.uid).get();
    const data = doc.data() as { attendance?: string; cgpa?: string; credits?: string; backlogs?: string } | undefined;
    if (!data) return mockStats;

    return [
      { label: 'Attendance', value: data.attendance || '0%', color: '#10B981' },
      { label: 'CGPA', value: data.cgpa || '0.0', color: '#1A3C6E' },
      { label: 'Credits', value: data.credits || '0', color: '#F4A020' },
      { label: 'Backlogs', value: data.backlogs || '0', color: '#10B981' },
    ];
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return mockStats;
  }
}

// Fetch timetable for a specific day
export async function fetchTimetable(day: string): Promise<ClassItem[]> {
  try {
    const doc = await firebaseFirestore.collection('timetables').doc(day).get();
    if (!doc.exists) return mockTimetable[day] || [];
    const data = doc.data() as { classes?: ClassItem[] } | undefined;
    return data?.classes || mockTimetable[day] || [];
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return mockTimetable[day] || [];
  }
}

// Fetch all events
export async function fetchEvents(): Promise<EventItem[]> {
  try {
    const snapshot = await firebaseFirestore.collection('events').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
  } catch (error) {
    console.error('Error fetching events:', error);
    return mockEvents;
  }
}

// Fetch all announcements
export async function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  try {
    const snapshot = await firebaseFirestore.collection('announcements').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnnouncementItem));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return mockAnnouncements;
  }
}

// Fetch all clubs
export async function fetchClubs(): Promise<ClubItem[]> {
  try {
    const snapshot = await firebaseFirestore.collection('clubs').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubItem));
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return mockClubs;
  }
}

// Update event registration status
export async function updateEventRegistration(eventId: string, registered: boolean): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) return;

  try {
    await firebaseFirestore.collection('events').doc(eventId).update({
      registered,
    });
  } catch (error) {
    console.error('Error updating event registration:', error);
  }
}

// Mark announcement as read
export async function markAnnouncementAsRead(announcementId: string): Promise<void> {
  try {
    await firebaseFirestore.collection('announcements').doc(announcementId).update({
      unread: false,
    });
  } catch (error) {
    console.error('Error marking announcement as read:', error);
  }
}