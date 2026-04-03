import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import {
  mockUser,
  mockAnnouncements,
  mockStats,
  mockAttendance,
  mockTimetable,
} from '../data/mockData';

const TAG_COLORS: Record<string, string> = {
  exam: '#EF4444',
  event: '#8B5CF6',
  general: '#3B82F6',
  important: '#F59E0B',
};

const STAT_ICONS: Record<string, string> = {
  Attendance: '◔',
  CGPA: '◎',
  Credits: '✦',
  Backlogs: '✓',
};

const CLASS_ICONS = {
  live: '▶',
  done: '✓',
  upcoming: '◌',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getAttendancePercent(attended: number, total: number) {
  return Math.round((attended / total) * 100);
}

function getDayKey() {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  return day.slice(0, 3);
}

function parseTimeToMinutes(timeStr: string) {
  const [time, period] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (period === 'PM' && h !== 12) hours += 12;
  if (period === 'AM' && h === 12) hours = 0;
  return hours * 60 + m;
}

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(18)).current;
  const unread = mockAnnouncements.filter(item => item.unread).length;
  const todayKey = getDayKey();
  const todayTimetable = mockTimetable[todayKey] ?? [];
  const now = new Date();
  const nowInMinutes = now.getHours() * 60 + now.getMinutes();
  const todayClasses = todayTimetable.map((cls, index) => {
    const currentClassTime = parseTimeToMinutes(cls.time);
    const nextClassTime =
      index < todayTimetable.length - 1
        ? parseTimeToMinutes(todayTimetable[index + 1].time)
        : currentClassTime + 60;

    return {
      ...cls,
      done: nowInMinutes >= nextClassTime,
      current: nowInMinutes >= currentClassTime && nowInMinutes < nextClassTime,
    };
  });
  const completedClasses = todayClasses.filter(cls => cls.done).length;
  const lowAttendance = mockAttendance
    .map(item => ({
      ...item,
      percent: getAttendancePercent(item.attended, item.total),
    }))
    .sort((a, b) => a.percent - b.percent);
  const lowestAttendance = lowAttendance[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <Animated.ScrollView
        style={[
          styles.scroll,
          { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>{getTodayLabel()}</Text>
            <Text style={styles.headerTitle}>{getGreeting()}, {mockUser.name.split(' ')[0]}</Text>
            <Text style={styles.headerSubtitle}>
              {mockUser.semester} • {mockUser.section} Section
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.unreadPill}>
              <Text style={styles.unreadPillText}>{unread} new</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{mockUser.avatar}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {mockStats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}16` }]}>
                  <Text style={[styles.statIconText, { color: stat.color }]}>
                    {STAT_ICONS[stat.label] ?? '•'}
                  </Text>
                </View>
                <View style={[styles.statAccent, { backgroundColor: stat.color }]} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {lowestAttendance && lowestAttendance.percent < 75 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertLabel}>Attention Needed</Text>
            <Text style={styles.alertTitle}>{lowestAttendance.subject} is below target</Text>
            <Text style={styles.alertBody}>
              You are at {lowestAttendance.percent}% attendance. Prioritize the next few classes to stay above 75%.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
            <Text style={styles.sectionMeta}>{completedClasses}/{todayClasses.length} done</Text>
          </View>

          {todayClasses.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No classes today</Text>
              <Text style={styles.emptyBody}>Your timetable is clear for {todayKey}.</Text>
            </View>
          )}

          {todayClasses.map(cls => {
            const statusLabel = cls.current ? 'Live' : cls.done ? 'Completed' : 'Upcoming';
            const statusStyle = cls.current
              ? styles.statusLive
              : cls.done
                ? styles.statusDone
                : styles.statusUpcoming;

            return (
              <View key={cls.id} style={[styles.classCard, cls.current && styles.classCardLive]}>
                <View style={styles.classIndex}>
                  <Text
                    style={[
                      styles.classIndexIcon,
                      { color: cls.current ? colors.primary : cls.done ? colors.success : colors.textSecondary },
                    ]}
                  >
                    {cls.current ? CLASS_ICONS.live : cls.done ? CLASS_ICONS.done : CLASS_ICONS.upcoming}
                  </Text>
                </View>

                <View style={styles.classMain}>
                  <View style={styles.classTopRow}>
                    <Text style={styles.classSubject}>{cls.subject}</Text>
                    <View style={[styles.statusChip, statusStyle]}>
                      <Text style={[styles.statusChipText, cls.current && styles.statusChipTextLive]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.classMeta}>{cls.time} • {cls.room}</Text>
                  <Text style={styles.classFaculty}>{cls.faculty}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance Snapshot</Text>
            <Text style={styles.sectionMeta}>Top priorities</Text>
          </View>

          {lowAttendance.slice(0, 3).map(item => (
            <View key={item.subject} style={styles.attendanceCard}>
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceCopy}>
                  <View style={styles.attendanceTitleRow}>
                    <Text
                      style={[
                        styles.attendanceTitleIcon,
                        { color: item.percent >= 75 ? colors.success : colors.danger },
                      ]}
                    >
                      ↗
                    </Text>
                    <Text style={styles.attendanceSubject}>{item.subject}</Text>
                  </View>
                  <Text style={styles.attendanceDetail}>
                    {item.attended}/{item.total} classes attended
                  </Text>
                </View>
                <Text
                  style={[
                    styles.attendancePercent,
                    { color: item.percent >= 75 ? colors.success : colors.danger },
                  ]}
                >
                  {item.percent}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percent}%`,
                      backgroundColor: item.percent >= 75 ? colors.success : colors.danger,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <Text style={styles.sectionMeta}>{unread} unread</Text>
          </View>

          {mockAnnouncements.slice(0, 3).map(item => (
            <TouchableOpacity key={item.id} style={styles.announcementCard} activeOpacity={0.85}>
              <View style={styles.announcementTopRow}>
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: `${TAG_COLORS[item.type] ?? '#888'}18` },
                  ]}
                >
                  <Text style={[styles.tagText, { color: TAG_COLORS[item.type] ?? '#888' }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.announcementTime}>{item.time}</Text>
              </View>

              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementBody} numberOfLines={2}>
                {item.body}
              </Text>

              <View style={styles.announcementFooter}>
                <View style={styles.announcementActionWrap}>
                  <Text style={styles.announcementAction}>{item.actionLabel ?? 'Open'}</Text>
                  <Text style={styles.announcementArrow}>↗</Text>
                </View>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.66)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 6,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 12,
  },
  unreadPill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  unreadPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 18,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.4%',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 18,
    fontWeight: '800',
  },
  statAccent: {
    width: 34,
    height: 5,
    borderRadius: 999,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  alertCard: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  alertLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C2D12',
    marginBottom: 6,
  },
  alertBody: {
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  sectionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  classCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  classCardLive: {
    borderWidth: 1,
    borderColor: 'rgba(26,60,110,0.12)',
    backgroundColor: '#F8FBFF',
  },
  classIndex: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classIndexText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  classIndexIcon: {
    fontSize: 18,
    fontWeight: '800',
  },
  classMain: {
    flex: 1,
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 10,
  },
  classSubject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  classMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  classFaculty: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusUpcoming: {
    backgroundColor: '#EEF2FF',
  },
  statusDone: {
    backgroundColor: '#ECFDF5',
  },
  statusLive: {
    backgroundColor: colors.primary,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  statusChipTextLive: {
    color: colors.white,
  },
  attendanceCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  attendanceCopy: {
    flex: 1,
  },
  attendanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  attendanceTitleIcon: {
    fontSize: 15,
    fontWeight: '800',
  },
  attendanceSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  attendanceDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  attendancePercent: {
    fontSize: 20,
    fontWeight: '800',
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  announcementCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  announcementTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  announcementBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  announcementFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  announcementArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
