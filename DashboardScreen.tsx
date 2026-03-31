import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { mockUser, mockAnnouncements, mockClasses, mockStats, mockAttendance } from '../data/mockData';

const TAG_COLORS: Record<string, string> = {
  exam: '#EF4444', event: '#8B5CF6',
  general: '#3B82F6', important: '#F59E0B',
};

function AttendanceRing({ attended, total, subject, color }: { attended: number; total: number; subject: string; color: string }) {
  const pct = Math.round((attended / total) * 100);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  const status = pct >= 75 ? '✓' : '⚠';
  const statusColor = pct >= 75 ? colors.success : colors.warning;

  return (
    <View style={ringStyles.container}>
      <View style={ringStyles.svgWrap}>
        {/* Background track */}
        <View style={[ringStyles.track, { borderColor: color + '20' }]} />
        {/* We fake the ring with a colored border */}
        <View style={[ringStyles.fill, {
          borderColor: color,
          borderWidth: 5,
          opacity: pct / 100,
        }]} />
        <View style={ringStyles.center}>
          <Text style={[ringStyles.pct, { color }]}>{pct}%</Text>
        </View>
      </View>
      <Text style={ringStyles.subject} numberOfLines={2}>{subject.split(' ')[0]}</Text>
      <Text style={[ringStyles.status, { color: statusColor }]}>{attended}/{total}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { alignItems: 'center', width: 72 },
  svgWrap: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  track: { position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 5 },
  fill: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  center: { position: 'absolute' },
  pct: { fontSize: 13, fontWeight: 'bold' },
  subject: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  status: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.95], extrapolate: 'clamp' });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.name}>{mockUser.name}</Text>
            <View style={styles.usnBadge}>
              <Text style={styles.usnText}>{mockUser.usn}</Text>
              <Text style={styles.dot}> · </Text>
              <Text style={styles.usnText}>{mockUser.section} Section</Text>
            </View>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{mockUser.avatar}</Text>
          </View>
        </Animated.View>

        {/* ── Date Strip ── */}
        <View style={styles.dateStrip}>
          {[-2, -1, 0, 1, 2].map(offset => {
            const d = new Date(today);
            d.setDate(today.getDate() + offset);
            const isToday = offset === 0;
            return (
              <View key={offset} style={[styles.dateChip, isToday && styles.dateChipActive]}>
                <Text style={[styles.dateDayLabel, isToday && styles.dateActiveText]}>{days[d.getDay()]}</Text>
                <Text style={[styles.dateDateNum, isToday && styles.dateActiveText]}>{d.getDate()}</Text>
                {isToday && <View style={styles.todayDot} />}
              </View>
            );
          })}
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {mockStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Attendance ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>2 low</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ringsRow}>
            {mockAttendance.map((item) => (
              <AttendanceRing
                key={item.subject}
                attended={item.attended}
                total={item.total}
                subject={item.subject}
                color={item.color}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Today's Classes ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <Text style={styles.sectionSub}>{mockUser.semester}</Text>
          </View>
          {mockClasses.map((cls) => (
            <View key={cls.id} style={[styles.classCard, cls.current && styles.classCardCurrent, cls.done && styles.classCardDone]}>
              {cls.current && (
                <View style={styles.liveTag}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <View style={[styles.classAccent, { backgroundColor: cls.current ? colors.primary : cls.done ? colors.success : colors.border }]} />
              <View style={styles.classContent}>
                <Text style={[styles.classTime, cls.done && styles.textDone]}>{cls.time}</Text>
                <Text style={[styles.classSubject, cls.done && styles.textDone]}>{cls.subject}</Text>
                <Text style={styles.classFaculty}>{cls.faculty}</Text>
              </View>
              <View style={styles.classRight}>
                <View style={styles.roomTag}>
                  <Text style={styles.roomText}>{cls.room}</Text>
                </View>
                {cls.done && <Text style={styles.doneCheck}>✓</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* ── Announcements ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {mockAnnouncements.map((item) => (
            <TouchableOpacity key={item.id} style={styles.annoCard} activeOpacity={0.75}>
              {item.unread && <View style={styles.unreadDot} />}
              <View style={styles.annoTop}>
                <View style={[styles.tag, { backgroundColor: (TAG_COLORS[item.type] ?? '#888') + '18' }]}>
                  <Text style={[styles.tagText, { color: TAG_COLORS[item.type] ?? '#888' }]}>{item.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.annoTime}>{item.time}</Text>
              </View>
              <Text style={styles.annoTitle}>{item.title}</Text>
              <Text style={styles.annoBody} numberOfLines={2}>{item.body}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  usnBadge: { flexDirection: 'row', marginTop: 4 },
  usnText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  dot: { color: 'rgba(255,255,255,0.4)' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.accent, justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: colors.white },
  dateStrip: {
    backgroundColor: colors.primary, flexDirection: 'row',
    justifyContent: 'space-around', paddingHorizontal: 16, paddingBottom: 20,
  },
  dateChip: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  dateChipActive: { backgroundColor: colors.accent },
  dateDayLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  dateDateNum: { fontSize: 17, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' },
  dateActiveText: { color: colors.white },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.white, marginTop: 3 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: -14,
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, gap: 8,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionSub: { fontSize: 12, color: colors.textSecondary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  alertBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  alertText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  ringsRow: { gap: 16, paddingVertical: 8, paddingHorizontal: 4 },
  classCard: {
    backgroundColor: colors.white, borderRadius: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  classCardCurrent: { elevation: 4, backgroundColor: '#F0F4FF' },
  classCardDone: { opacity: 0.6 },
  classAccent: { width: 4, alignSelf: 'stretch' },
  classContent: { flex: 1, padding: 14 },
  classTime: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  classSubject: { fontSize: 15, fontWeight: '700', color: colors.text },
  classFaculty: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  classRight: { paddingRight: 14, alignItems: 'flex-end', gap: 6 },
  roomTag: { backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roomText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  doneCheck: { fontSize: 16, color: colors.success },
  liveTag: {
    position: 'absolute', top: 8, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  liveText: { fontSize: 10, color: colors.danger, fontWeight: 'bold' },
  textDone: { color: colors.textLight },
  annoCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, elevation: 1,
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
  },
  annoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700' },
  annoTime: { fontSize: 11, color: colors.textLight },
  annoTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  annoBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});