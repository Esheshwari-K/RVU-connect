// Updated: 2026-04-05
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { fetchTimetable, ClassItem } from '../services/firebaseData';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORIES = ['Class Timetable', 'Exam / Internals'] as const;
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

type AppNavigation = BottomTabNavigationProp<MainTabParamList>;
type TimetableRoute = RouteProp<MainTabParamList, 'Timetable'>;

function getCountdown(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `In ${days} days`;
}

export default function TimetableScreen() {
  const navigation = useNavigation<AppNavigation>();
  const route = useRoute<TimetableRoute>();
  const todayIdx = new Date().getDay();
  const defaultDay = todayIdx === 0 || todayIdx === 7 ? 'Mon' : DAYS[todayIdx - 1];
  const [selected, setSelected] = useState(route.params?.focusDay ?? defaultDay);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(route.params?.highlightExamId ? 'Exam / Internals' : 'Class Timetable');
  const [timetable, setTimetable] = useState<Record<string, ClassItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        // Load timetable for all days
        const timetableData: Record<string, ClassItem[]> = {};
        for (const day of DAYS) {
          const dayData = await fetchTimetable(day);
          timetableData[day] = dayData;
        }
        setTimetable(timetableData);
      } catch (error) {
        console.error('Error loading timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, []);

  useEffect(() => {
    if (route.params?.focusDay) {
      setSelected(route.params.focusDay);
      setCategory('Class Timetable');
    }
    if (route.params?.highlightExamId) {
      setCategory('Exam / Internals');
    }
  }, [route.params?.focusDay, route.params?.highlightExamId]);

  const classes = timetable[selected] ?? [];
  const examInternals = mockExamInternalsTimetable; // TODO: Replace with Firebase fetch
  const isClassMode = category === 'Class Timetable';
  const highlightedExamId = route.params?.highlightExamId;
  const nextExam = [...examInternals].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.categoryRow}>
        {CATEGORIES.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.categoryChip, category === item && styles.categoryChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryEyebrow}>{isClassMode ? 'Day Snapshot' : 'Upcoming Assessment'}</Text>
        <Text style={styles.summaryTitle}>
          {isClassMode
            ? classes.length === 0 ? `No classes on ${selected}` : `${classes.length} classes lined up for ${selected}`
            : nextExam ? `${nextExam.title} ${getCountdown(nextExam.startDate).toLowerCase()}` : 'No exams scheduled'}
        </Text>
        <Text style={styles.summaryText}>
          {isClassMode
            ? classes.length === 0
              ? 'You have a free day. This is a good place to surface study suggestions later.'
              : `${classes[0].time} is your first session. Tap any class to jump to the venue on the map.`
            : nextExam
              ? `${nextExam.date} · ${nextExam.time} · ${nextExam.venue}`
              : 'Schedule will be updated soon.'}
        </Text>
      </View>

      {isClassMode && (
        <View style={styles.dayRow}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selected === day && styles.dayChipActive]}
              onPress={() => setSelected(day)}
            >
              <Text style={[styles.dayText, selected === day && styles.dayTextActive]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {isClassMode ? `${classes.length} classes` : `${examInternals.length} schedules`}
        </Text>
        <Text style={styles.countSub}>
          · {isClassMode ? (selected === defaultDay ? 'Today' : selected) : 'Upcoming'}
        </Text>
      </View>

      <View style={styles.timeline}>
        {isClassMode && classes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>Free</Text>
            <Text style={styles.emptyTitle}>No classes</Text>
            <Text style={styles.emptySub}>Enjoy the lighter day and plan ahead.</Text>
          </View>
        ) : !isClassMode && examInternals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>Soon</Text>
            <Text style={styles.emptyTitle}>No exams yet</Text>
            <Text style={styles.emptySub}>Schedule will be updated soon.</Text>
          </View>
        ) : !isClassMode ? (
          examInternals.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.examCard, highlightedExamId === item.id && styles.examCardActive]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Map', {
                focusBuildingId: item.buildingId,
                focusRoom: item.venue,
                source: item.title,
              })}
            >
              <View style={styles.examTopRow}>
                <Text style={styles.examTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.examTypeBadge,
                    { backgroundColor: item.type === 'Exam' ? '#EF444420' : '#1A3C6E20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.examTypeText,
                      { color: item.type === 'Exam' ? '#EF4444' : '#1A3C6E' },
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.examMeta}>Date: {item.date}</Text>
              <Text style={styles.examMeta}>Time: {item.time}</Text>
              <Text style={styles.examMeta}>Venue: {item.venue}</Text>
              <Text style={styles.examAction}>Open venue on map</Text>
            </TouchableOpacity>
          ))
        ) : (
          classes.map((cls, idx) => {
            const color = SUBJECT_COLORS[cls.subject] ?? colors.primary;
            return (
              <View key={cls.id} style={styles.classRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{cls.time}</Text>
                  {idx < classes.length - 1 && <View style={styles.timeLine} />}
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.classCard, { borderLeftColor: color }]}
                  onPress={() => navigation.navigate('Map', {
                    focusBuildingId: cls.buildingId,
                    focusRoom: cls.room,
                    source: cls.subject,
                  })}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.subjectName}>{cls.subject}</Text>
                    <View style={[styles.roomBadge, { backgroundColor: color + '15' }]}>
                      <Text style={[styles.roomText, { color }]}>{cls.room}</Text>
                    </View>
                  </View>
                  <Text style={styles.facultyText}>{cls.faculty}</Text>
                  <Text style={styles.cardAction}>Tap for directions</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categoryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 6,
    gap: 8,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  categoryTextActive: { color: colors.white },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryEyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  summaryText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginTop: 6 },
  dayRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 12,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  dayChipActive: { backgroundColor: colors.primary },
  dayText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  dayTextActive: { color: colors.white },
  countRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  countText: { fontSize: 16, fontWeight: '700', color: colors.text },
  countSub: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  timeline: { paddingHorizontal: 16 },
  classRow: { flexDirection: 'row', marginBottom: 16 },
  timeCol: { width: 72, alignItems: 'flex-end', paddingRight: 16, paddingTop: 14 },
  timeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  timeLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 8 },
  classCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  subjectName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  roomBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roomText: { fontSize: 12, fontWeight: '700' },
  facultyText: { fontSize: 12, color: colors.textSecondary },
  cardAction: { marginTop: 10, fontSize: 12, fontWeight: '700', color: colors.primary },
  empty: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  examCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  examCardActive: { borderColor: colors.primary, backgroundColor: '#F8FAFF' },
  examTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  examTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  examTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  examTypeText: { fontSize: 12, fontWeight: '700' },
  examMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  examAction: { marginTop: 10, fontSize: 12, fontWeight: '700', color: colors.primary },
});
