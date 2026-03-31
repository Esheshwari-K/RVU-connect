import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { mockTimetable, mockExamInternalsTimetable } from '../data/mockData';

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

export default function TimetableScreen() {
  const todayIdx = new Date().getDay();
  const defaultDay = todayIdx === 0 || todayIdx === 7 ? 'Mon' : DAYS[todayIdx - 1];
  const [selected, setSelected] = useState(defaultDay);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Class Timetable');

  const classes = mockTimetable[selected] ?? [];
  const examInternals = mockExamInternalsTimetable;
  const isClassMode = category === 'Class Timetable';

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

      {/* Day selector */}
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

      {/* Class count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {isClassMode ? `${classes.length} classes` : `${examInternals.length} schedules`}
        </Text>
        <Text style={styles.countSub}>
          · {isClassMode ? (selected === defaultDay ? 'Today' : selected) : 'Upcoming'}
        </Text>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {isClassMode && classes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No classes!</Text>
            <Text style={styles.emptySub}>Enjoy your free day</Text>
          </View>
        ) : !isClassMode && examInternals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No exams/internals!</Text>
            <Text style={styles.emptySub}>Schedule will be updated soon</Text>
          </View>
        ) : !isClassMode ? (
          examInternals.map(item => (
            <View key={item.id} style={styles.examCard}>
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
            </View>
          ))
        ) : (
          classes.map((cls, idx) => {
            const color = SUBJECT_COLORS[cls.subject] ?? colors.primary;
            return (
              <View key={cls.id} style={styles.classRow}>
                {/* Time column */}
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{cls.time}</Text>
                  {idx < classes.length - 1 && <View style={styles.timeLine} />}
                </View>
                {/* Card */}
                <View style={[styles.classCard, { borderLeftColor: color }]}>
                  <View style={styles.cardTop}>
                    <Text style={styles.subjectName}>{cls.subject}</Text>
                    <View style={[styles.roomBadge, { backgroundColor: color + '15' }]}>
                      <Text style={[styles.roomText, { color }]}>{cls.room}</Text>
                    </View>
                  </View>
                  <Text style={styles.facultyText}>👨‍🏫 {cls.faculty}</Text>
                </View>
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
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextActive: { color: colors.white },
  dayRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16,
    gap: 8, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  dayChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', backgroundColor: colors.background,
  },
  dayChipActive: { backgroundColor: colors.primary },
  dayText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  dayTextActive: { color: colors.white },
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  countText: { fontSize: 16, fontWeight: '700', color: colors.text },
  countSub: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  timeline: { paddingHorizontal: 16 },
  classRow: { flexDirection: 'row', marginBottom: 16 },
  timeCol: { width: 72, alignItems: 'flex-end', paddingRight: 16, paddingTop: 14 },
  timeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  timeLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 8 },
  classCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14,
    borderLeftWidth: 4, padding: 14,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  subjectName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  roomBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roomText: { fontSize: 12, fontWeight: '700' },
  facultyText: { fontSize: 12, color: colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
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
  },
  examTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  examTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  examMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
