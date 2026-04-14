import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Switch, Dimensions,
  Image
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

const { width } = Dimensions.get('window');

function getSemesterProgress() {
  const start = new Date('2026-01-06');
  const end = new Date('2026-05-10');
  const now = new Date();
  const total = end.getTime() - start.getTime();
  const done = Math.min(now.getTime() - start.getTime(), total);
  const pct = Math.round((done / total) * 100);
  const totalWeeks = Math.round(total / (7 * 24 * 60 * 60 * 1000));
  const doneWeeks = Math.min(totalWeeks, Math.round(done / (7 * 24 * 60 * 60 * 1000)));
  return { pct, doneWeeks, totalWeeks };
}

const BUS_ROUTES = [
  { id: '1', route: 'Rajajinagar → RVU Campus', time: '7:45 AM / 5:30 PM', stops: 6 },
  { id: '2', route: 'Jayanagar → RVU Campus', time: '7:30 AM / 5:45 PM', stops: 8 },
  { id: '3', route: 'Electronic City → RVU Campus', time: '7:15 AM / 6:00 PM', stops: 5 },
  { id: '4', route: 'Yelahanka → RVU Campus', time: '7:00 AM / 6:15 PM', stops: 7 },
];

const TRANSPORT_CONTACT_EMAIL = 'transport@rvu.edu.in';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const route = useRoute<RouteProp<MainTabParamList, 'Profile'>>();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showBus, setShowBus] = useState(false);
  const sem = getSemesterProgress();
  const scrollRef = useRef<ScrollView | null>(null);
  const digitalIdY = useRef(0);

  const profile = user?.profile;
  const attendance = profile?.attendance ?? [];
  const lowCount = attendance.filter(
    i => Math.round((i.attended / i.total) * 100) < 75
  ).length;

  const stats = [
    { label: 'CGPA', value: profile?.cgpa ?? '—', color: '#8B5CF6' },
    { label: 'Credits', value: profile?.credits ?? '—', color: '#10B981' },
    { label: 'Backlogs', value: profile?.backlogs ?? '0', color: profile?.backlogs === '0' ? '#10B981' : '#EF4444' },
    { label: 'Attendance', value: `${attendance.length > 0 ? Math.round(attendance.reduce((a, i) => a + (i.attended / i.total) * 100, 0) / attendance.length) : 0}%`, color: '#1A3C6E' },
  ];

  const quickActions = [
    { emoji: '📊', label: 'Results', onPress: () => Alert.alert('Results', `CGPA: ${profile?.cgpa}\nCredits: ${profile?.credits}\nBacklogs: ${profile?.backlogs}`) },
    { emoji: '📅', label: 'Calendar', onPress: () => Alert.alert('Academic Calendar', 'Semester: Jan 6 – May 10, 2026\nMid-Sem: Apr 8–21\nEnd-Sem: May 2026') },
    { emoji: '🔑', label: 'Password', onPress: () => Alert.alert('Reset Password', `A reset link will be sent to:\n${user?.email}`) },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleBusRoutePress = (route: string) => {
    Alert.alert(
      'Transportation Enquiry',
      `${route}\n\nFor further enquiry, contact:\n${TRANSPORT_CONTACT_EMAIL}`
    );
  };



  useEffect(() => {
    if (route.params?.focusSection === 'digitalId') {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, digitalIdY.current - 24),
          animated: true,
        });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [route.params?.focusSection]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <View style={[styles.avatar, { backgroundColor: profile?.color ?? colors.accent }]}>
            <Text style={styles.avatarText}>{user?.avatar ?? 'ST'}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.name}</Text>
        <Text style={styles.heroDegree}>{profile?.programFull}</Text>
        <Text style={styles.heroMeta}>
          {user?.semester} · {user?.year} · Section {user?.section}
        </Text>
        <View style={[styles.usnBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.usnText}>🎓 {user?.usn}</Text>
        </View>

        {/* Semester progress */}
        <View style={styles.semWrap}>
          <View style={styles.semRow}>
            <Text style={styles.semLabel}>Semester Progress</Text>
            <Text style={styles.semLabel}>Week {sem.doneWeeks}/{sem.totalWeeks}</Text>
          </View>
          <View style={styles.semTrack}>
            <View style={[styles.semFill, { width: `${sem.pct}%` as any }]} />
          </View>
          <Text style={styles.semSub}>{sem.pct}% completed</Text>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Digital ID Card ── */}
      <View
        style={styles.section}
        onLayout={event => {
          digitalIdY.current = event.nativeEvent.layout.y;
        }}
      >
        <Text style={styles.sectionTitle}>Digital Student ID</Text>
        <View style={styles.idCard}>
          {/* Card header */}
          <View style={styles.idHeader}>
            <View>
              <Text style={styles.idUniversity}>RV University</Text>
              <Text style={styles.idCardLabel}>DIGITAL STUDENT ID CARD</Text>
            </View>
            <View style={styles.idActiveBadge}>
              <View style={styles.idActiveDot} />
              <Text style={styles.idActiveText}>ACTIVE</Text>
            </View>
          </View>

          {/* Card body */}
          <View style={styles.idBody}>
            <View style={[styles.idAvatar, { backgroundColor: profile?.color ?? colors.accent }]}>
              <Text style={styles.idAvatarText}>{user?.avatar}</Text>
            </View>
            <View style={styles.idInfo}>
              <Text style={styles.idFieldLabel}>NAME</Text>
              <Text style={styles.idFieldValue}>{user?.name}</Text>
              <Text style={styles.idFieldLabel}>USN</Text>
              <Text style={styles.idFieldValue}>{user?.usn}</Text>
              <Text style={styles.idFieldLabel}>PROGRAM</Text>
              <Text style={styles.idFieldValue}>{profile?.program} · {profile?.schoolShort}</Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.barcodeWrap}>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${user?.usn || 'RVU'}` }}
              style={styles.qrCode}
            />
            <Text style={styles.barcodeText}>{user?.usn?.split('').join('  ')}</Text>
          </View>
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.quickCard}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <Text style={styles.quickEmoji}>{a.emoji}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Attendance ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          {lowCount > 0 && (
            <View style={styles.lowBadge}>
              <Text style={styles.lowBadgeText}>{lowCount} below 75%</Text>
            </View>
          )}
        </View>
        {attendance.map(item => {
          const pct = Math.round((item.attended / item.total) * 100);
          const isLow = pct < 75;
          const barColor = isLow ? '#EF4444' : item.color;
          const needed = isLow
            ? Math.ceil((0.75 * item.total - item.attended) / 0.25)
            : null;
          return (
            <View key={item.subject} style={[styles.attCard, isLow && styles.attCardLow]}>
              <View style={styles.attTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attSubject}>{item.subject}</Text>
                  <Text style={styles.attCount}>{item.attended}/{item.total} classes</Text>
                </View>
                <Text style={[styles.attPct, { color: barColor }]}>{pct}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${pct}%` as any,
                  backgroundColor: barColor,
                }]} />
              </View>
              {isLow && needed !== null && (
                <Text style={styles.attWarn}>
                  ⚠️ Need {needed} more class{needed > 1 ? 'es' : ''} to reach 75%
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Student Info ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.infoCard}>
          {[
            { label: 'USN', value: user?.usn ?? '—', emoji: '🎓' },
            { label: 'Program', value: profile?.programFull ?? '—', emoji: '💻' },
            { label: 'School', value: profile?.school ?? '—', emoji: '🏫' },
            { label: 'Semester', value: user?.semester ?? '—', emoji: '📚' },
            { label: 'Section', value: user?.section ?? '—', emoji: '👥' },
            { label: 'Batch', value: user?.batch ?? '—', emoji: '📅' },
            { label: 'Email', value: user?.email ?? '—', emoji: '📧' },
            { label: 'Degree', value: profile?.degree ?? '—', emoji: '🎯' },
          ].map((row, idx, arr) => (
            <View key={row.label} style={[
              styles.infoRow,
              idx < arr.length - 1 && styles.infoRowBorder,
            ]}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoEmoji}>{row.emoji}</Text>
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Transportation ── */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.transportHeader}
          onPress={() => setShowBus(!showBus)}
          activeOpacity={0.75}
        >
          <View>
            <Text style={styles.sectionTitle}>🚌 Transportation</Text>
            <Text style={styles.transportSub}>RVU Campus Bus Routes</Text>
          </View>
          <Text style={styles.transportChevron}>{showBus ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showBus && (
          <View style={styles.busGrid}>
            {BUS_ROUTES.map(bus => (
              <TouchableOpacity
                key={bus.id}
                style={styles.busCard}
                onPress={() => handleBusRoutePress(bus.route)}
                activeOpacity={0.8}
              >
                <View style={styles.busIconWrap}>
                  <Text style={styles.busIcon}>🚌</Text>
                </View>
                <View style={styles.busInfo}>
                  <Text style={styles.busRoute}>{bus.route}</Text>
                  <Text style={styles.busTiming}>⏰ {bus.time}</Text>
                </View>
                <View style={styles.busStops}>
                  <Text style={styles.busStopsNum}>{bus.stops}</Text>
                  <Text style={styles.busStopsLabel}>stops</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Preferences ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.infoCard}>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoEmoji}>🔔</Text>
              <Text style={styles.infoLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoEmoji}>🌙</Text>
              <Text style={styles.infoLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => Alert.alert('Coming Soon', 'Dark mode in the next update!')}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* ── App info ── */}
      <View style={[styles.section, styles.appInfoCard]}>
        <Text style={styles.appInfoName}>RVU Connect</Text>
        <Text style={styles.appInfoSub}>Version 1.0.0 · {profile?.school}</Text>
        <Text style={styles.appInfoTag}>Your Smart Campus Companion 🎓</Text>
      </View>

      {/* ── Sign out ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 24, paddingBottom: 28, paddingHorizontal: 24,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroDegree: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 3, textAlign: 'center' },
  heroMeta: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 12 },
  usnBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 18 },
  usnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  semWrap: { width: '100%' },
  semRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  semLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  semTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  semFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  semSub: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'center' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16, marginTop: -16,
    backgroundColor: '#fff', borderRadius: 18,
    padding: 16, gap: 4,
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statVal: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

  // Section
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  lowBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  lowBadgeText: { fontSize: 11, color: '#DC2626', fontWeight: '700' },

  // ID Card
  idCard: {
    backgroundColor: colors.primary,
    borderRadius: 20, overflow: 'hidden',
    elevation: 6, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  idHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 18, paddingBottom: 12,
  },
  idUniversity: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  idCardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  idActiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  idActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  idActiveText: { fontSize: 10, fontWeight: '800', color: '#4ADE80', letterSpacing: 0.5 },
  idBody: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 18, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  idAvatar: {
    width: 72, height: 88, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  idAvatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  idInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  idFieldLabel: { fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 1, marginTop: 6 },
  idFieldValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  barcodeWrap: {
    backgroundColor: '#fff', margin: 12,
    borderRadius: 10, paddingVertical: 12,
    alignItems: 'center',
  },
  qrCode: { width: 80, height: 80, marginBottom: 8 },
  barcodeText: { fontSize: 10, color: colors.textSecondary, letterSpacing: 3, fontWeight: '600' },

  // Quick actions
  quickGrid: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  quickEmoji: { fontSize: 26, marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.text },

  // Attendance
  attCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 8, elevation: 1,
  },
  attCardLow: { borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFFBFB' },
  attTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  attSubject: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  attCount: { fontSize: 11, color: colors.textSecondary },
  attPct: { fontSize: 17, fontWeight: 'bold' },
  progressBg: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  attWarn: { fontSize: 11, color: '#DC2626', fontWeight: '600', marginTop: 8 },

  // Student info
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16,
    overflow: 'hidden', elevation: 2,
  },
  infoRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    paddingVertical: 13, justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  infoEmoji: { fontSize: 16, width: 22 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1.2, textAlign: 'right' },

  // Transportation
  transportHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  transportSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  transportChevron: { fontSize: 13, color: colors.textSecondary },
  busGrid: { gap: 10 },
  busCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, elevation: 1,
  },
  busIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  busIcon: { fontSize: 20 },
  busInfo: { flex: 1 },
  busRoute: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  busTiming: { fontSize: 12, color: colors.textSecondary },
  busStops: { alignItems: 'center' },
  busStopsNum: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  busStopsLabel: { fontSize: 10, color: colors.textSecondary },

  // App info
  appInfoCard: {
    backgroundColor: colors.primary + '08',
    borderRadius: 16, padding: 20,
    alignItems: 'center',
    borderWidth: 1, borderColor: colors.primary + '20',
  },
  appInfoName: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  appInfoSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  appInfoTag: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },

  // Logout
  logoutBtn: {
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1.5, borderColor: colors.danger,
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
