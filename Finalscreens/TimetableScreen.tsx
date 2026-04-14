import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

type AppNavigation = BottomTabNavigationProp<MainTabParamList>;

const { width } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type ExamItem = {
  id: string;
  subject: string;
  date: string;
  time: string;
  venue: string;
  type: 'Internal' | 'Exam';
  seatNo: string;
  room: string;
  block: string;
  paperCode: string;
  syllabus?: string;
  fallbackDaysLeft?: number;
};

type HallTicketInfo = {
  candidateName: string;
  usnLabel?: string;
  examCenter: string;
  reportingTime: string;
  instructions: string;
};

const SUBJECT_COLORS: Record<string, string> = {
  'Data Structures': '#1A3C6E',
  'Computer Networks': '#10B981',
  'Operating Systems': '#F59E0B',
  'Machine Learning': '#8B5CF6',
  'Web Technologies': '#EF4444',
  'Computer Networks Lab': '#10B981',
  'Data Structures Lab': '#1A3C6E',
  'Machine Learning Lab': '#8B5CF6',
  'Mini Project': '#3B82F6',
};

const EXAM_SCHEDULES: Record<string, ExamItem[]> = {
  bca: [
    { id: 'bca-1', subject: 'Data Structures Internal - 1', date: 'Apr 14, 2026', time: '9:30 AM - 10:30 AM', venue: 'CS Block · Room 204', type: 'Internal', seatNo: 'BCA-117', room: '204', block: 'CS Block', paperCode: 'BCA-CS2808', syllabus: 'Modules 1 & 2', fallbackDaysLeft: 1 },
    { id: 'bca-2', subject: 'Operating Systems Internal - 1', date: 'Apr 16, 2026', time: '11:00 AM - 12:00 PM', venue: 'CS Block · Room 109', type: 'Internal', seatNo: 'BCA-117', room: '109', block: 'CS Block', paperCode: 'BCA-CS2809', syllabus: 'Modules 1, 2 & 3', fallbackDaysLeft: 3 },
    { id: 'bca-3', subject: 'Computer Networks Mid-Sem', date: 'Apr 22, 2026', time: '2:00 PM - 5:00 PM', venue: 'Main Block · Hall 2', type: 'Exam', seatNo: 'BCA-117', room: 'Hall 2', block: 'Main Block', paperCode: 'BCA-CS2810', syllabus: 'Units 1-4', fallbackDaysLeft: 9 },
    { id: 'bca-4', subject: 'Machine Learning Mid-Sem', date: 'Apr 25, 2026', time: '9:30 AM - 12:30 PM', venue: 'Main Block · Hall 1', type: 'Exam', seatNo: 'BCA-117', room: 'Hall 1', block: 'Main Block', paperCode: 'BCA-CS2811', syllabus: 'Units 1-3', fallbackDaysLeft: 12 },
  ],
  btech: [
    { id: 'btech-1', subject: 'Advanced Algorithms Internal - 1', date: 'Apr 15, 2026', time: '9:00 AM - 10:00 AM', venue: 'ET Block · Room 302', type: 'Internal', seatNo: 'BT-224', room: '302', block: 'ET Block', paperCode: 'BT-CS2808', syllabus: 'Modules 1 & 2', fallbackDaysLeft: 2 },
    { id: 'btech-2', subject: 'Database Systems Internal - 1', date: 'Apr 17, 2026', time: '11:30 AM - 12:30 PM', venue: 'ET Block · Room 208', type: 'Internal', seatNo: 'BT-224', room: '208', block: 'ET Block', paperCode: 'BT-CS2809', syllabus: 'Modules 1-3', fallbackDaysLeft: 4 },
    { id: 'btech-3', subject: 'Cloud Computing Mid-Sem', date: 'Apr 23, 2026', time: '2:00 PM - 5:00 PM', venue: 'Main Block · Hall 4', type: 'Exam', seatNo: 'BT-224', room: 'Hall 4', block: 'Main Block', paperCode: 'BT-CS2810', syllabus: 'Units 1-5', fallbackDaysLeft: 10 },
    { id: 'btech-4', subject: 'Cybersecurity Mid-Sem', date: 'Apr 26, 2026', time: '9:30 AM - 12:30 PM', venue: 'Main Block · Hall 3', type: 'Exam', seatNo: 'BT-224', room: 'Hall 3', block: 'Main Block', paperCode: 'BT-CS2811', syllabus: 'Units 1-4', fallbackDaysLeft: 13 },
  ],
  bdes: [
    { id: 'bdes-1', subject: 'Typography & Layout Internal - 1', date: 'Apr 14, 2026', time: '10:00 AM - 11:00 AM', venue: 'Design Block · Studio 2', type: 'Internal', seatNo: 'BD-086', room: 'Studio 2', block: 'Design Block', paperCode: 'BD-DS2301', syllabus: 'Modules 1 & 2', fallbackDaysLeft: 1 },
    { id: 'bdes-2', subject: 'UX Research Internal - 1', date: 'Apr 18, 2026', time: '1:30 PM - 2:30 PM', venue: 'Design Block · UX Lab', type: 'Internal', seatNo: 'BD-086', room: 'UX Lab', block: 'Design Block', paperCode: 'BD-DS2302', syllabus: 'Modules 1-3', fallbackDaysLeft: 5 },
    { id: 'bdes-3', subject: 'Visual Design Mid-Sem Jury', date: 'Apr 24, 2026', time: '10:00 AM - 1:00 PM', venue: 'Design Block · Jury Hall', type: 'Exam', seatNo: 'BD-086', room: 'Jury Hall', block: 'Design Block', paperCode: 'BD-DS2303', syllabus: 'Units 1-4', fallbackDaysLeft: 11 },
    { id: 'bdes-4', subject: 'Design Thinking Mid-Sem', date: 'Apr 28, 2026', time: '2:00 PM - 5:00 PM', venue: 'Main Block · Hall 5', type: 'Exam', seatNo: 'BD-086', room: 'Hall 5', block: 'Main Block', paperCode: 'BD-DS2304', syllabus: 'Units 1-5', fallbackDaysLeft: 15 },
  ],
  vc: [
    { id: 'vc-1', subject: 'Photography Internal - 1', date: 'Apr 13, 2026', time: '9:30 AM - 10:30 AM', venue: 'Media Block · Studio A', type: 'Internal', seatNo: 'VC-054', room: 'Studio A', block: 'Media Block', paperCode: 'VC-PH-IA1', syllabus: 'Modules 1 & 2', fallbackDaysLeft: 0 },
    { id: 'vc-2', subject: 'Advertising Design Internal - 1', date: 'Apr 17, 2026', time: '2:00 PM - 3:00 PM', venue: 'Design Block · Room 118', type: 'Internal', seatNo: 'VC-054', room: '118', block: 'Design Block', paperCode: 'VC-AD-IA1', syllabus: 'Modules 1-3', fallbackDaysLeft: 4 },
    { id: 'vc-3', subject: 'Film & Video Mid-Sem', date: 'Apr 23, 2026', time: '9:30 AM - 12:30 PM', venue: 'Media Block · Preview Theatre', type: 'Exam', seatNo: 'VC-054', room: 'Preview Theatre', block: 'Media Block', paperCode: 'VC-FV-MID', syllabus: 'Units 1-4', fallbackDaysLeft: 10 },
    { id: 'vc-4', subject: 'Digital Media Mid-Sem', date: 'Apr 27, 2026', time: '1:30 PM - 4:30 PM', venue: 'Main Block · Hall 6', type: 'Exam', seatNo: 'VC-054', room: 'Hall 6', block: 'Main Block', paperCode: 'VC-DM-MID', syllabus: 'Units 1-5', fallbackDaysLeft: 14 },
  ],
};

function getProgramKey(program?: string) {
  const value = (program ?? '').toLowerCase();
  if (value.includes('btech')) return 'btech';
  if (value.includes('bdes')) return 'bdes';
  if (value.includes('vc')) return 'vc';
  return 'bca';
}

function getDaysLeft(dateLabel: string) {
  const examDate = new Date(dateLabel);
  if (Number.isNaN(examDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((examDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
}

const MOTIVATIONAL: Record<number, string> = {
  0: 'No classes today. Rest up and plan ahead.',
  1: 'Light day ahead. Make it count.',
  2: 'Easy schedule today.',
};

export default function TimetableScreen() {
  const { user } = useAuth();
  const nav = useNavigation<AppNavigation>();
  const todayIdx = new Date().getDay();
  const defaultDay = todayIdx === 0 ? 'Mon' : DAYS[todayIdx - 1] ?? 'Mon';
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [tab, setTab] = useState<'class' | 'exam'>('class');
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const timetable = useMemo(() => user?.profile.timetable ?? {}, [user]);
  const programKey = useMemo(() => getProgramKey(user?.profile?.program), [user]);
  const exams = useMemo(
    () => (EXAM_SCHEDULES[programKey] ?? []).map(exam => ({
      ...exam,
      daysLeft: getDaysLeft(exam.date) ?? exam.fallbackDaysLeft ?? 7,
      date: exam.date || 'Apr 20, 2026',
    })),
    [programKey]
  );
  const hallTicket = useMemo<HallTicketInfo>(() => ({
    candidateName: user?.name ?? 'Student',
    usnLabel: user?.usn ?? 'RVU000000',
    examCenter: programKey === 'bdes' || programKey === 'vc' ? 'RVU Main Campus, School Blocks' : 'RVU Main Campus, Examination Wing',
    reportingTime: exams[0]?.type === 'Internal' ? '30 mins before the exam' : '45 mins before the exam',
    instructions: 'Carry your digital ID card and hall ticket. Reach the block early for seat verification.',
  }), [exams, programKey, user]);

  const classes = timetable[selectedDay] ?? [];
  const isToday = selectedDay === defaultDay;
  const nextExam = exams[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'class' && styles.tabActive]}
          onPress={() => setTab('class')}
        >
          <Text style={[styles.tabText, tab === 'class' && styles.tabTextActive]}>
            Class Timetable
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'exam' && styles.tabActive]}
          onPress={() => setTab('exam')}
        >
          <Text style={[styles.tabText, tab === 'exam' && styles.tabTextActive]}>
            Exam / Internals
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'class' ? (
        <>
          <View style={styles.dayRow}>
            {DAYS.map(day => {
              const isSelected = selectedDay === day;
              const hasClasses = (timetable[day] ?? []).length > 0;
              const classCount = (timetable[day] ?? []).length;

              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isSelected && styles.dayChipActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                    {day}
                  </Text>
                  <Text style={[styles.dayCount, isSelected && styles.dayCountActive]}>
                    {classCount > 0 ? classCount : '-'}
                  </Text>
                  {hasClasses && !isSelected ? <View style={styles.activityDot} /> : null}
                  {day === defaultDay && !isSelected ? <View style={styles.todayRing} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.snapshotCard}>
            <View style={styles.snapshotLeft}>
              <Text style={styles.snapshotEyebrow}>
                {isToday ? 'Today · ' : ''}
                {selectedDay}
              </Text>
              <Text style={styles.snapshotTitle}>
                {classes.length === 0
                  ? 'No classes!'
                  : `${classes.length} class${classes.length > 1 ? 'es' : ''} lined up`}
              </Text>
              <Text style={styles.snapshotSub}>
                {classes.length === 0
                  ? MOTIVATIONAL[0]
                  : `First session at ${classes[0].time} · Tap any class for directions`}
              </Text>
            </View>
            {classes.length > 0 ? (
              <View style={styles.snapshotBadge}>
                <Text style={styles.snapshotBadgeNum}>{classes.length}</Text>
                <Text style={styles.snapshotBadgeLabel}>classes</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.timeline}>
            {classes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>Free day</Text>
                <Text style={styles.emptyTitle}>Nothing scheduled</Text>
                <Text style={styles.emptySub}>No classes scheduled for {selectedDay}</Text>
              </View>
            ) : (
              classes.map((cls, idx) => {
                const color = SUBJECT_COLORS[cls.subject] ?? colors.primary;
                const isLast = idx === classes.length - 1;

                return (
                  <View key={cls.id} style={styles.timelineRow}>
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{cls.time}</Text>
                      {!isLast ? <View style={styles.timeConnector} /> : null}
                    </View>

                    <TouchableOpacity style={styles.classCard} activeOpacity={0.8} onPress={() => nav.navigate('Map')}>
                      <View style={[styles.classAccent, { backgroundColor: color }]} />
                      <View style={styles.classBody}>
                        <View style={styles.classTop}>
                          <Text style={styles.classSubject}>{cls.subject}</Text>
                          <View style={[styles.roomPill, { backgroundColor: `${color}18` }]}>
                            <Text style={[styles.roomText, { color }]}>{cls.room}</Text>
                          </View>
                        </View>
                        <Text style={styles.classFaculty}>{cls.faculty}</Text>
                        <Text style={styles.classAction}>Tap for directions</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </>
      ) : (
        <>
          {nextExam ? (
            <View style={styles.nextExamCard}>
              <Text style={styles.nextExamEyebrow}>
                {nextExam.daysLeft === 0 ? 'Today' : `In ${nextExam.daysLeft} days`}
              </Text>
              <Text style={styles.nextExamTitle}>{nextExam.subject}</Text>
              <Text style={styles.nextExamMeta}>
                {nextExam.date} · {nextExam.time}
              </Text>
              <Text style={styles.nextExamVenue}>{nextExam.venue}</Text>
            </View>
          ) : null}

          <View style={styles.hallTicketCard}>
            <View style={styles.hallTicketHeader}>
              <View>
                <Text style={styles.hallTicketEyebrow}>Hall Ticket</Text>
                <Text style={styles.hallTicketTitle}>{hallTicket.candidateName}</Text>
              </View>
              <View style={styles.hallTicketChip}>
                <Text style={styles.hallTicketChipText}>{user?.profile?.program ?? 'Program'}</Text>
              </View>
            </View>
            <Text style={styles.hallTicketMeta}>USN: {hallTicket.usnLabel}</Text>
            <Text style={styles.hallTicketMeta}>Exam Centre: {hallTicket.examCenter}</Text>
            <Text style={styles.hallTicketMeta}>Reporting Time: {hallTicket.reportingTime}</Text>
            <Text style={styles.hallTicketSub}>{hallTicket.instructions}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Hall Ticket', `Hall ticket ready for download.\n\nStudent: ${hallTicket.candidateName}\nUSN: ${hallTicket.usnLabel}`)}
            >
              <Text style={styles.downloadButtonText}>Download Hall Ticket</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.examSection}>
            <Text style={styles.examSectionTitle}>
              {exams.length} schedules · {user?.profile?.program ?? 'Program'}
            </Text>
            {exams.map((exam, idx) => (
              <TouchableOpacity
                key={exam.id}
                style={[styles.examCard, idx === 0 && styles.examCardHighlight]}
                activeOpacity={0.8}
                onPress={() => setSelectedExam(exam)}
              >
                <View style={styles.examLeft}>
                  <View
                    style={[
                      styles.examTypePill,
                      {
                        backgroundColor: exam.type === 'Exam' ? '#FEE2E2' : '#EDE9FE',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.examTypeText,
                        { color: exam.type === 'Exam' ? '#DC2626' : '#7C3AED' },
                      ]}
                    >
                      {exam.type}
                    </Text>
                  </View>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <Text style={styles.examDate}>{exam.date}</Text>
                  <Text style={styles.examTime}>{exam.time}</Text>
                  <Text style={styles.examVenue}>{exam.venue}</Text>
                  <Text style={styles.examAction}>Tap to view seating arrangement</Text>
                </View>
                <View style={styles.examRight}>
                  <View
                    style={[
                      styles.daysLeftBadge,
                      {
                        backgroundColor:
                          exam.daysLeft === 0
                            ? '#FEE2E2'
                            : exam.daysLeft <= 3
                              ? '#FEF3C7'
                              : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.daysLeftNum,
                        {
                          color:
                            exam.daysLeft === 0
                              ? '#DC2626'
                              : exam.daysLeft <= 3
                                ? '#D97706'
                                : colors.textSecondary,
                        },
                      ]}
                    >
                      {exam.daysLeft === 0 ? 'Today' : `${exam.daysLeft}d`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />

      <Modal
        visible={Boolean(selectedExam)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedExam(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedExam(null)}>
          <Pressable style={styles.examModal} onPress={() => { }}>
            {selectedExam && (
              <>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <View style={[styles.examTypePill, { backgroundColor: selectedExam.type === 'Exam' ? '#FEE2E2' : '#EDE9FE' }]}>
                    <Text style={[styles.examTypeText, { color: selectedExam.type === 'Exam' ? '#DC2626' : '#7C3AED' }]}>
                      {selectedExam.type}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedExam(null)} activeOpacity={0.8}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>{selectedExam.subject}</Text>
                <Text style={styles.modalSub}>{selectedExam.date} · {selectedExam.time}</Text>

                <View style={styles.seatingCard}>
                  <Text style={styles.seatingTitle}>Seating Arrangement</Text>
                  <Text style={styles.seatingRow}>Room: {selectedExam.room}</Text>
                  <Text style={styles.seatingRow}>Block: {selectedExam.block}</Text>
                  <Text style={styles.seatingRow}>Seat No: {selectedExam.seatNo}</Text>
                  <Text style={styles.seatingRow}>Paper Code: {selectedExam.paperCode}</Text>
                  {selectedExam.syllabus && (
                    <Text style={styles.seatingRow}>Syllabus: {selectedExam.syllabus}</Text>
                  )}
                </View>

                <Text style={styles.seatingNote}>
                  Bring your digital ID and hall ticket. Reach the room at least 30 minutes early for verification.
                </Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  dayRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 14 },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 1,
    position: 'relative',
  },
  dayChipActive: { backgroundColor: colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  dayTextActive: { color: colors.white },
  dayCount: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  dayCountActive: { color: 'rgba(255,255,255,0.75)' },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginLeft: -2,
  },
  todayRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  snapshotCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  snapshotLeft: { flex: 1 },
  snapshotEyebrow: { fontSize: 11, color: colors.primary, fontWeight: '700', marginBottom: 4 },
  snapshotTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  snapshotSub: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  snapshotBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  snapshotBadgeNum: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  snapshotBadgeLabel: { fontSize: 10, color: colors.primary },
  timeline: { paddingHorizontal: 16 },
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timeCol: { width: 70, alignItems: 'flex-end', paddingRight: 14, paddingTop: 16 },
  timeText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  timeConnector: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 8 },
  classCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  classAccent: { width: 6 },
  classBody: { flex: 1, padding: 16 },
  classTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  classSubject: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  roomPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  roomText: { fontSize: 11, fontWeight: '700' },
  classFaculty: { marginTop: 8, fontSize: 12, color: colors.textSecondary },
  classAction: { marginTop: 8, fontSize: 12, color: colors.primary, fontWeight: '600' },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 18, fontWeight: '700', color: colors.primary },
  emptyTitle: { marginTop: 8, fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  nextExamCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.primary,
  },
  nextExamEyebrow: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  nextExamTitle: { marginTop: 8, fontSize: 22, fontWeight: '800', color: colors.white },
  nextExamMeta: { marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  nextExamVenue: { marginTop: 6, fontSize: 13, color: colors.white },
  hallTicketCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.white,
    elevation: 2,
  },
  hallTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  hallTicketEyebrow: { fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  hallTicketTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  hallTicketChip: {
    backgroundColor: `${colors.primary}12`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hallTicketChipText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  hallTicketMeta: { marginTop: 8, fontSize: 13, color: colors.textSecondary },
  hallTicketSub: { marginTop: 10, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  downloadButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  downloadButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  examSection: { paddingHorizontal: 16 },
  examSectionTitle: { marginBottom: 12, fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  examCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: width * 0.24,
  },
  examCardHighlight: { borderWidth: 1, borderColor: `${colors.primary}30` },
  examLeft: { flex: 1 },
  examTypePill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  examTypeText: { fontSize: 11, fontWeight: '700' },
  examSubject: { marginTop: 10, fontSize: 16, fontWeight: '700', color: colors.text },
  examDate: { marginTop: 8, fontSize: 12, color: colors.textSecondary },
  examTime: { marginTop: 4, fontSize: 12, color: colors.textSecondary },
  examVenue: { marginTop: 4, fontSize: 12, color: colors.textSecondary },
  examAction: { marginTop: 8, fontSize: 12, fontWeight: '700', color: colors.primary },
  examRight: { justifyContent: 'center', marginLeft: 12 },
  daysLeftBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  daysLeftNum: { fontSize: 12, fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  examModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: { fontSize: 18, fontWeight: '700', color: colors.textSecondary },
  modalTitle: { marginTop: 12, fontSize: 20, fontWeight: '800', color: colors.text },
  modalSub: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
  seatingCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: `${colors.primary}10`,
    padding: 16,
  },
  seatingTitle: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  seatingRow: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '600' },
  seatingNote: { marginTop: 14, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
