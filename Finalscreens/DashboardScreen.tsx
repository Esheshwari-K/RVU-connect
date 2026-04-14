import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Modal, Pressable, RefreshControl,
  StatusBar, StyleSheet, Text,
  useColorScheme, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/MainTabNavigator';
import { useAuth } from '../context/AuthContext';

type AppNavigation = BottomTabNavigationProp<MainTabParamList>;
type ClassItem = { id: string; subject: string; time: string; room: string; faculty: string; done: boolean; current?: boolean };
type AttendanceItem = { subject: string; attended: number; total: number; color: string };
type AnnouncementItem = { id: string; title: string; body: string; time: string; type: string; unread: boolean };
type QuickPanel = 'library' | 'grievance' | null;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CLASS_DURATION = 60;
const GRIEVANCE_EMAIL = 'studentgrievance@rvu.edu.in';
const LIBRARY_PUBLICATIONS = [
  { title: 'Foundations of Data Science', kind: 'Book', subject: 'Computer Science' },
  { title: 'Contemporary Indian Design Systems', kind: 'Book', subject: 'Design' },
  { title: 'Media Ethics in the Digital Age', kind: 'Article', subject: 'Visual Communication' },
  { title: 'Sustainable Urban Architecture Review', kind: 'Journal', subject: 'Architecture & Planning' },
  { title: 'Behavioral Economics for Modern Business', kind: 'Book', subject: 'Management' },
  { title: 'Biotechnology Frontiers 2026', kind: 'Journal', subject: 'Life Sciences' },
];

// ── Helpers ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

function parseTime(t: string) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  const d = new Date(); d.setHours(h, min, 0, 0); return d;
}

function getMinutesUntil(timeStr: string) {
  const t = parseTime(timeStr);
  if (!t) return null;
  const diff = t.getTime() - Date.now();
  return diff > 0 ? Math.floor(diff / 60000) : null;
}

function getClassState(item: ClassItem) {
  if (item.done) return { label: 'Done', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: 'check-circle' } as const;
  const start = parseTime(item.time);
  if (!start) return { label: 'Upcoming', color: '#233036', bg: 'rgba(35,48,54,0.08)', icon: 'clock' } as const;
  const end = new Date(start.getTime() + CLASS_DURATION * 60000);
  const now = new Date();
  if (item.current || (now >= start && now <= end)) return { label: 'Live now', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'radio' } as const;
  if (now > end) return { label: 'Done', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: 'check-circle' } as const;
  return { label: 'Upcoming', color: '#233036', bg: 'rgba(35,48,54,0.08)', icon: 'clock' } as const;
}

function getAnnouncementAccent(type: string) {
  switch (type) {
    case 'exam': return { color: '#EF4444', bg: '#FEF2F2', emoji: '📝' };
    case 'important': return { color: '#F59E0B', bg: '#FFFBEB', emoji: '⚠️' };
    case 'event': return { color: '#8B5CF6', bg: '#F5F3FF', emoji: '🎉' };
    default: return { color: '#233036', bg: 'rgba(35,48,54,0.08)', emoji: '📢' };
  }
}

function getStateEmoji(label: string) {
  switch (label) {
    case 'Done': return '✅';
    case 'Live now': return '🔴';
    default: return '🕒';
  }
}

// ── Pulse skeleton ──
function Skeleton({ pulse, h, w, r }: { pulse: Animated.Value; h: number; w: number | string; r: number }) {
  return <Animated.View style={{ height: h, width: w as any, borderRadius: r, backgroundColor: '#DDE3EE', opacity: pulse }} />;
}

// ── ScalePress ──
function Tap({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  const s = useRef(new Animated.Value(1)).current;
  const go = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => go(0.97)} onPressOut={() => go(1)}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const nav = useNavigation<AppNavigation>();
  const { width } = useWindowDimensions();
  const isDark = useColorScheme() === 'dark';
  const displayFirstName = user?.firstName?.trim() || user?.name?.trim().split(' ')[0] || 'Student';

  const profile = user?.profile;
  const attendance = useMemo(() => (profile?.attendance ?? []) as AttendanceItem[], [profile]);
  const announcements = useMemo(() => (profile?.announcements ?? []) as AnnouncementItem[], [profile]);
  const todayKey = DAYS[new Date().getDay()];
  const todayClasses = useMemo(() => ((profile?.timetable?.[todayKey] ?? []) as ClassItem[]), [profile, todayKey]);

  const pulse = useRef(new Animated.Value(0.4)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalClass, setModalClass] = useState<ClassItem | null>(null);
  const [modalAnnouncement, setModalAnnouncement] = useState<AnnouncementItem | null>(null);
  const [quickPanel, setQuickPanel] = useState<QuickPanel>(null);

  const greeting = getGreeting();
  const classStates = useMemo(() => todayClasses.map(i => ({ item: i, state: getClassState(i) })), [todayClasses]);
  const nextClass = classStates.find(e => e.state.label !== 'Done')?.item ?? null;
  const liveClass = classStates.find(e => e.state.label === 'Live now')?.item ?? null;
  const focusClass = liveClass ?? nextClass;
  const completed = classStates.filter(e => e.state.label === 'Done').length;
  const remaining = classStates.filter(e => e.state.label !== 'Done').length;
  const unread = announcements.filter(a => a.unread).length;
  const countdown = nextClass && !liveClass ? getMinutesUntil(nextClass.time) : null;

  const avgAttendance = useMemo(() => {
    if (!attendance.length) return 0;
    return Math.round(attendance.reduce((s, i) => s + (i.attended / i.total) * 100, 0) / attendance.length);
  }, [attendance]);

  const lowSubjects = useMemo(() => attendance.filter(i => (i.attended / i.total) * 100 < 75), [attendance]);
  const cgpa = profile?.cgpa ?? '—';

  // Colours
  const bg = isDark ? '#0A0F1A' : '#F2F4F8';
  const card = isDark ? '#111827' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.07)' : '#E8ECF0';
  const text = isDark ? '#F0F4F8' : '#111827';
  const muted = isDark ? '#8FA3B1' : '#6B7280';
  const soft = isDark ? '#6B7E8A' : '#9CA3AF';

  useEffect(() => {
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.9, duration: 750, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.4, duration: 750, useNativeDriver: true }),
    ]));
    pulseLoop.start();
    const t = setTimeout(() => {
      setLoading(false);
      pulseLoop.stop();
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 5 }),
      ]).start();
    }, 700);
    return () => { clearTimeout(t); pulseLoop.stop(); };
  }, []);

  // Floating tab bar
  useEffect(() => {
    nav.setOptions({
      headerShown: false,
      tabBarActiveTintColor: '#F4A020',
      tabBarInactiveTintColor: soft,
      tabBarStyle: {
        position: 'absolute', left: 16, right: 16, bottom: 14,
        height: 64, paddingBottom: 8, paddingTop: 8,
        borderTopWidth: 0, borderRadius: 22,
        backgroundColor: isDark ? 'rgba(10,15,26,0.95)' : 'rgba(255,255,255,0.97)',
        shadowColor: '#233036', shadowOpacity: 0.15,
        shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    });
  }, [isDark]);

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#233036' }} edges={['top']}>
        <StatusBar backgroundColor="#233036" barStyle="light-content" />
        <View style={{ padding: 20, gap: 14 }}>
          <Skeleton pulse={pulse} h={12} w={120} r={6} />
          <Skeleton pulse={pulse} h={32} w={200} r={10} />
          <Skeleton pulse={pulse} h={16} w={240} r={6} />
          <Skeleton pulse={pulse} h={130} w="100%" r={20} />
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton pulse={pulse} h={130} w={(width - 44) / 2} r={18} />
            <Skeleton pulse={pulse} h={130} w={(width - 44) / 2} r={18} />
          </View>
          <Skeleton pulse={pulse} h={100} w="100%" r={18} />
          <Skeleton pulse={pulse} h={90} w="100%" r={18} />
          <Skeleton pulse={pulse} h={90} w="100%" r={18} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#233036' }} edges={['top']}>
      <StatusBar backgroundColor="#233036" barStyle="light-content" />
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F4A020']} tintColor="#F4A020" />}
      >
        {/* ══ HERO ══ */}
        <View style={s.hero}>
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
            {/* Top row */}
            <View style={s.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.heroDate}>{getTodayLabel()}</Text>
                <Text style={s.heroGreeting}>{greeting.emoji} {greeting.text},</Text>
                <Text style={s.heroName}>{displayFirstName}</Text>
                <Text style={s.heroSub}>{profile?.program} · {user?.usn} · Sec {user?.section}</Text>
              </View>
              <View style={s.heroRight}>
                {/* Notification */}
                <Pressable
                  style={s.bellWrap}
                  onPress={() => nav.navigate('Events')}
                >
                  <Text style={s.heroEmoji}>🔔</Text>
                  {unread > 0 && (
                    <View style={s.bellDot}>
                      <Text style={s.bellDotText}>{unread}</Text>
                    </View>
                  )}
                </Pressable>
                {/* Avatar */}
                <Pressable onPress={() => nav.navigate('Profile')}>
                  <View style={[s.avatar, { backgroundColor: profile?.color ?? '#F4A020' }]}>
                    <Text style={s.avatarText}>{user?.avatar ?? 'RV'}</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Next / live class pill */}
            <Tap onPress={() => nav.navigate('Timetable')} style={s.focusPill}>
              <View style={{ flex: 1 }}>
                <Text style={s.focusPillEye}>
                  {liveClass ? '🔴  Ongoing right now' : countdown !== null ? `⏰  In ${countdown} min` : '📅  Next class'}
                </Text>
                <Text style={s.focusPillTitle}>
                  {focusClass ? focusClass.subject : 'No more classes today 🎉'}
                </Text>
                {focusClass && (
                  <Text style={s.focusPillMeta}>{focusClass.time} · {focusClass.room} · {focusClass.faculty}</Text>
                )}
              </View>
              <View style={s.focusPillArrow}>
                <Text style={s.focusPillArrowText}>→</Text>
              </View>
            </Tap>

            {/* Quick actions */}
            <View style={s.heroActions}>
              <View style={s.heroActionSlot}>
                <Tap onPress={() => nav.navigate('Profile', { focusSection: 'digitalId' })} style={s.heroActionBtn}>
                  <View style={s.heroActionIconWrap}>
                    <Text style={s.heroActionEmoji}>🪪</Text>
                  </View>
                  <Text style={s.heroActionText}>Digital ID</Text>
                </Tap>
              </View>
              <View style={s.heroActionSlot}>
                <Tap onPress={() => setQuickPanel('library')} style={s.heroActionBtn}>
                  <View style={s.heroActionIconWrap}>
                    <Text style={s.heroActionEmoji}>📚</Text>
                  </View>
                  <Text style={s.heroActionText}>New Publications</Text>
                </Tap>
              </View>
              <View style={s.heroActionSlot}>
                <Tap onPress={() => setQuickPanel('grievance')} style={s.heroActionBtn}>
                  <View style={s.heroActionIconWrap}>
                    <Text style={s.heroActionEmoji}>📝</Text>
                  </View>
                  <Text style={s.heroActionText}>Student Grievance</Text>
                </Tap>
              </View>
              <View style={s.heroActionSlot}>
                <Tap onPress={() => nav.navigate('Profile')} style={s.heroActionBtn}>
                  <View style={s.heroActionIconWrap}>
                    <Text style={s.heroActionEmoji}>👤</Text>
                  </View>
                  <Text style={s.heroActionText}>Profile</Text>
                </Tap>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ══ BODY ══ */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], paddingHorizontal: 16, paddingTop: 20, gap: 14 }}>

          {/* ── Stats row ── */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Attendance card */}
            <Tap onPress={() => nav.navigate('Profile')} style={[s.statCard, { flex: 1, backgroundColor: card, borderColor: border }]}>
              <View style={s.statTop}>
                <View style={[s.statIcon, { backgroundColor: avgAttendance >= 75 ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={s.cardEmoji}>📊</Text>
                </View>
                <Text style={[s.statLabel, { color: muted }]}>Attendance</Text>
              </View>
              <Text style={[s.statValue, { color: avgAttendance >= 75 ? '#10B981' : '#EF4444' }]}>{avgAttendance}%</Text>
              <Text style={[s.statNote, { color: soft }]}>
                {lowSubjects.length > 0 ? `${lowSubjects.length} subject${lowSubjects.length > 1 ? 's' : ''} below 75%` : 'All subjects on track'}
              </Text>
              <View style={{ height: 5, backgroundColor: avgAttendance >= 75 ? '#D1FAE5' : '#FEE2E2', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <View style={{ height: 5, width: `${avgAttendance}%` as any, backgroundColor: avgAttendance >= 75 ? '#10B981' : '#EF4444', borderRadius: 3 }} />
              </View>
            </Tap>

            {/* CGPA + today card */}
            <View style={{ flex: 1, gap: 12 }}>
              <View style={[s.miniCard, { backgroundColor: card, borderColor: border }]}>
                <View style={[s.statIcon, { backgroundColor: 'rgba(35,48,54,0.08)' }]}>
                  <Text style={s.cardEmoji}>🏅</Text>
                </View>
                <Text style={[s.miniValue, { color: text }]}>{cgpa}</Text>
                <Text style={[s.miniLabel, { color: muted }]}>CGPA</Text>
              </View>
              <View style={[s.miniCard, { backgroundColor: card, borderColor: border }]}>
                <View style={[s.statIcon, { backgroundColor: remaining > 0 ? '#FEF3C7' : '#D1FAE5' }]}>
                  <Text style={s.cardEmoji}>📚</Text>
                </View>
                <Text style={[s.miniValue, { color: text }]}>{completed}/{todayClasses.length}</Text>
                <Text style={[s.miniLabel, { color: muted }]}>Classes done</Text>
              </View>
            </View>
          </View>

          {/* ── Low attendance warning ── */}
          {lowSubjects.length > 0 && (
            <View style={[s.warningCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={s.inlineEmoji}>⚠️</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E' }}>Attendance needs attention</Text>
              </View>
              {lowSubjects.slice(0, 2).map(sub => {
                const pct = Math.round((sub.attended / sub.total) * 100);
                const need = Math.ceil((0.64 * sub.total - sub.attended) / 0.25);
                return (
                  <Text key={sub.subject} style={{ fontSize: 12, color: '#92400E', lineHeight: 19 }}>
                    · {sub.subject}: {pct}% — attend {need} more to reach 75%
                  </Text>
                );
              })}
            </View>
          )}

          {/* ── Today's classes ── */}
          <View>
            <View style={s.secRow}>
              <View>
                <Text style={[s.secTitle, { color: text }]}>Today's schedule</Text>
                <Text style={[s.secSub, { color: muted }]}>{completed} of {todayClasses.length} complete</Text>
              </View>
              <Tap onPress={() => nav.navigate('Timetable')} style={[s.secBadge, { backgroundColor: card, borderColor: border }]}>
                <Text style={[s.secBadgeText, { color: muted }]}>{todayKey} · See all</Text>
              </Tap>
            </View>

            {todayClasses.length === 0 ? (
              <View style={[s.emptyCard, { backgroundColor: card, borderColor: border }]}>
                <Text style={{ fontSize: 28 }}>☕</Text>
                <Text style={[s.emptyTitle, { color: text }]}>Free day!</Text>
                <Text style={[s.emptySub, { color: muted }]}>No classes scheduled. Great time to catch up or explore campus.</Text>
              </View>
            ) : (
              classStates.map(({ item, state }, idx) => (
                <Tap key={item.id} onPress={() => setModalClass(item)} style={[
                  s.classCard,
                  { backgroundColor: card, borderColor: state.label === 'Live now' ? '#F59E0B' : border },
                  state.label === 'Live now' && { backgroundColor: '#FFFBEB' },
                  idx < classStates.length - 1 && { marginBottom: 10 },
                ]}>
                  {/* Left accent bar */}
                  <View style={[s.classBar, { backgroundColor: state.label === 'Done' ? '#10B981' : state.label === 'Live now' ? '#F59E0B' : '#233036' }]} />
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={[s.classSubject, { color: state.label === 'Done' ? soft : text }]} numberOfLines={1}>
                        {item.subject}
                      </Text>
                      <View style={[s.classBadge, { backgroundColor: state.bg }]}>
                        <Text style={s.badgeEmoji}>{getStateEmoji(state.label)}</Text>
                        <Text style={[s.classBadgeText, { color: state.color }]}>{state.label}</Text>
                      </View>
                    </View>
                    <Text style={[s.classMeta, { color: muted }]}>{item.time} · {item.room}</Text>
                    <Text style={[s.classFaculty, { color: soft }]}>{item.faculty}</Text>
                  </View>
                </Tap>
              ))
            )}
          </View>

          {/* ── Announcements ── */}
          <View>
            <View style={s.secRow}>
              <View>
                <Text style={[s.secTitle, { color: text }]}>Announcements</Text>
                <Text style={[s.secSub, { color: muted }]}>{unread} unread</Text>
              </View>
              {unread > 0 && (
                <View style={[s.unreadBadge]}>
                  <Text style={s.unreadBadgeText}>{unread} new</Text>
                </View>
              )}
            </View>

            {announcements.slice(0, 3).map((item, idx) => {
              const accent = getAnnouncementAccent(item.type);
              return (
                <Tap key={item.id} onPress={() => setModalAnnouncement(item)} style={[
                  s.annoCard,
                  { backgroundColor: card, borderColor: border },
                  item.unread && { borderLeftWidth: 3, borderLeftColor: accent.color },
                  idx < Math.min(announcements.length, 3) - 1 && { marginBottom: 10 },
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={[s.annoIcon, { backgroundColor: accent.bg }]}>
                      <Text style={s.cardEmoji}>{accent.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Text style={[s.annoTitle, { color: text }]} numberOfLines={1}>{item.title}</Text>
                        {item.unread && (
                          <View style={[s.newDot, { backgroundColor: accent.color }]} />
                        )}
                      </View>
                      <Text style={[s.annoBody, { color: muted }]} numberOfLines={2}>{item.body}</Text>
                      <Text style={[s.annoTime, { color: soft }]}>{item.time}</Text>
                    </View>
                    <Text style={[s.chevronEmoji, { color: soft }]}>›</Text>
                  </View>
                </Tap>
              );
            })}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* ══ MODAL ══ */}
      <Modal
        visible={Boolean(modalClass || modalAnnouncement || quickPanel)}
        transparent animationType="slide"
        onRequestClose={() => { setModalClass(null); setModalAnnouncement(null); setQuickPanel(null); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(10,20,40,0.5)', justifyContent: 'flex-end' }}
          onPress={() => { setModalClass(null); setModalAnnouncement(null); setQuickPanel(null); }}
        >
          <Pressable style={[s.modal, { backgroundColor: card }]} onPress={() => { }}>
            {/* Handle */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: border, alignSelf: 'center', marginBottom: 20 }} />

            {modalClass && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#F4A020', textTransform: 'uppercase', letterSpacing: 1 }}>Class Details</Text>
                  <Pressable onPress={() => setModalClass(null)}>
                    <Text style={[s.closeGlyph, { color: muted }]}>✕</Text>
                  </Pressable>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: text, marginBottom: 6 }}>{modalClass.subject}</Text>
                <View style={[s.modalRow, { borderColor: border }]}>
                  <Text style={s.inlineEmoji}>⏰</Text>
                  <Text style={{ fontSize: 14, color: text, fontWeight: '600' }}>{modalClass.time} · {CLASS_DURATION} mins</Text>
                </View>
                <View style={[s.modalRow, { borderColor: border }]}>
                  <Text style={s.inlineEmoji}>📍</Text>
                  <Text style={{ fontSize: 14, color: text, fontWeight: '600' }}>{modalClass.room}</Text>
                </View>
                <View style={[s.modalRow, { borderColor: border }]}>
                  <Text style={s.inlineEmoji}>👨‍🏫</Text>
                  <Text style={{ fontSize: 14, color: text, fontWeight: '600' }}>{modalClass.faculty}</Text>
                </View>
                <View style={[s.modalRow, { borderColor: border }]}>
                  <Text style={s.inlineEmoji}>{getStateEmoji(getClassState(modalClass).label)}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: getClassState(modalClass).color }}>{getClassState(modalClass).label}</Text>
                </View>
                <Tap
                  onPress={() => { setModalClass(null); nav.navigate('Map'); }}
                  style={{ marginTop: 16, backgroundColor: '#233036', borderRadius: 14, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                >
                  <Text style={s.buttonEmoji}>🗺️</Text>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Find on Campus Map</Text>
                </Tap>
              </>
            )}

            {modalAnnouncement && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#F4A020', textTransform: 'uppercase', letterSpacing: 1 }}>Announcement</Text>
                  <Pressable onPress={() => setModalAnnouncement(null)}>
                    <Text style={[s.closeGlyph, { color: muted }]}>✕</Text>
                  </Pressable>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: text, lineHeight: 26, marginBottom: 10 }}>{modalAnnouncement.title}</Text>
                <Text style={{ fontSize: 14, color: muted, lineHeight: 22, marginBottom: 14 }}>{modalAnnouncement.body}</Text>
                <View style={[s.modalRow, { borderColor: border }]}>
                  <Text style={s.inlineEmoji}>🕒</Text>
                  <Text style={{ fontSize: 13, color: muted, fontWeight: '600' }}>{modalAnnouncement.time}</Text>
                </View>
                {modalAnnouncement.type === 'exam' && (
                  <Tap
                    onPress={() => { setModalAnnouncement(null); nav.navigate('Timetable'); }}
                    style={{ marginTop: 16, backgroundColor: '#233036', borderRadius: 14, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    <Text style={s.buttonEmoji}>📅</Text>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>View Exam Timetable</Text>
                  </Tap>
                )}
                {modalAnnouncement.type === 'event' && (
                  <Tap
                    onPress={() => { setModalAnnouncement(null); nav.navigate('Events'); }}
                    style={{ marginTop: 16, backgroundColor: '#8B5CF6', borderRadius: 14, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    <Text style={s.buttonEmoji}>🎉</Text>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>View Event Details</Text>
                  </Tap>
                )}
              </>
            )}

            {quickPanel === 'library' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#F4A020', textTransform: 'uppercase', letterSpacing: 1 }}>Library</Text>
                  <Pressable onPress={() => setQuickPanel(null)}>
                    <Text style={[s.closeGlyph, { color: muted }]}>✕</Text>
                  </Pressable>
                </View>
                <Text style={{ fontSize: 21, fontWeight: '800', color: text, marginBottom: 8 }}>New Publications</Text>
                <Text style={{ fontSize: 13, color: muted, lineHeight: 20, marginBottom: 14 }}>
                  Recently added books, journals, and articles across different schools and subjects.
                </Text>
                {LIBRARY_PUBLICATIONS.map(item => (
                  <View key={item.title} style={[s.quickInfoCard, { borderColor: border, backgroundColor: bg }]}>
                    <View style={[s.quickInfoIcon, { backgroundColor: 'rgba(35,48,54,0.08)' }]}>
                      <Text style={s.cardEmoji}>{item.kind === 'Article' ? '📰' : item.kind === 'Journal' ? '📘' : '📗'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: text }}>{item.title}</Text>
                      <Text style={{ fontSize: 12, color: muted, marginTop: 3 }}>{item.kind} · {item.subject}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {quickPanel === 'grievance' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#F4A020', textTransform: 'uppercase', letterSpacing: 1 }}>Support</Text>
                  <Pressable onPress={() => setQuickPanel(null)}>
                    <Text style={[s.closeGlyph, { color: muted }]}>✕</Text>
                  </Pressable>
                </View>
                <Text style={{ fontSize: 21, fontWeight: '800', color: text, marginBottom: 8 }}>Student Grievance</Text>
                <Text style={{ fontSize: 14, color: muted, lineHeight: 22, marginBottom: 16 }}>
                  Write your issue, concern, or problem in detail and send it to the student grievance cell.
                </Text>
                <View style={[s.grievanceBox, { backgroundColor: bg, borderColor: border }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: text, marginBottom: 6 }}>Contact Email</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#233036' }}>{GRIEVANCE_EMAIL}</Text>
                  <Text style={{ fontSize: 12, color: muted, marginTop: 8, lineHeight: 18 }}>
                    Include your name, USN, department, and a short description of the issue for faster resolution.
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // Hero
  hero: { backgroundColor: '#233036', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  heroDate: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: 4, letterSpacing: 0.3 },
  heroGreeting: { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  heroName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginTop: 1 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 5, lineHeight: 17 },
  heroRight: { alignItems: 'center', gap: 10, marginLeft: 12 },
  heroEmoji: { fontSize: 18 },
  bellWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#233036',
  },
  bellDotText: { fontSize: 8, color: '#fff', fontWeight: '900' },
  avatar: {
    width: 48, height: 48, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Focus pill
  focusPill: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  focusPillEye: { fontSize: 11, fontWeight: '800', color: '#F4A020', marginBottom: 4, letterSpacing: 0.3 },
  focusPillTitle: { fontSize: 17, fontWeight: '800', color: '#233036', marginBottom: 3 },
  focusPillMeta: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  focusPillArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(35,48,54,0.08)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  focusPillArrowText: { fontSize: 18, color: '#233036', fontWeight: '800' },

  // Quick hero actions
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroActionSlot: { width: '48%' },
  heroActionBtn: {
    width: '100%', minHeight: 88, alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  heroActionIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroActionEmoji: { fontSize: 18 },
  heroActionText: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },

  // Stats
  statCard: {
    borderRadius: 18, padding: 16,
    borderWidth: 1, elevation: 2,
    shadowColor: '#233036', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 16 },
  inlineEmoji: { fontSize: 15 },
  badgeEmoji: { fontSize: 12 },
  chevronEmoji: { fontSize: 22, fontWeight: '600', marginTop: -1 },
  buttonEmoji: { fontSize: 15 },
  closeGlyph: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12, fontWeight: '700' },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  statNote: { fontSize: 11, fontWeight: '600', marginTop: 4, lineHeight: 16 },
  miniCard: {
    flex: 1, borderRadius: 16, padding: 14,
    borderWidth: 1, elevation: 2,
    shadowColor: '#233036', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  miniValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  miniLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },

  // Warning
  warningCard: {
    borderRadius: 14, padding: 14,
    borderWidth: 1.5,
  },

  // Section headers
  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  secSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  secBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  secBadgeText: { fontSize: 11, fontWeight: '700' },
  unreadBadge: { backgroundColor: 'rgba(35,48,54,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  unreadBadgeText: { fontSize: 11, fontWeight: '800', color: '#233036' },

  // Classes
  classCard: {
    borderRadius: 16, padding: 14, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1,
    elevation: 1, shadowColor: '#233036',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  classBar: { width: 3, height: '100%', borderRadius: 2, position: 'absolute', left: 0, top: 0, bottom: 0 },
  classSubject: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  classMeta: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  classFaculty: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  classBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  classBadgeText: { fontSize: 10, fontWeight: '800' },

  // Announcements
  annoCard: {
    borderRadius: 16, padding: 14, borderWidth: 1,
    elevation: 1, shadowColor: '#233036',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  annoIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  annoTitle: { fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 18 },
  annoBody: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  annoTime: { fontSize: 11, fontWeight: '600', marginTop: 5 },
  newDot: { width: 7, height: 7, borderRadius: 4 },

  // Empty
  emptyCard: {
    borderRadius: 18, padding: 24, alignItems: 'center',
    borderWidth: 1, gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  // Modal
  modal: { borderRadius: 28, padding: 22, margin: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  quickInfoCard: {
    borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  quickInfoIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  grievanceBox: {
    borderWidth: 1, borderRadius: 16, padding: 14,
  },
});
