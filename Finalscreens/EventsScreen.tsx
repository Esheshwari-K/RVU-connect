import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { mockEvents, mockClubs } from '../data/mockData';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

const FILTERS = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

// ── Smart event state based on dates ──
function getEventState(startDate: string, registrationCloses: string, registered: boolean) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const close = new Date(registrationCloses).getTime();
  const daysToStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

  if (registered) {
    return {
      label: '✓ Registered',
      badgeBg: colors.success + '20',
      badgeColor: colors.success,
      cta: 'View Details',
      ctaBg: colors.background,
      ctaColor: colors.textSecondary,
    };
  }
  if (close < now) {
    return {
      label: 'Closed',
      badgeBg: colors.border,
      badgeColor: colors.textSecondary,
      cta: 'View Details',
      ctaBg: colors.border,
      ctaColor: colors.textSecondary,
    };
  }
  if (daysToStart <= 2) {
    return {
      label: '🔥 Starts soon',
      badgeBg: colors.warning + '20',
      badgeColor: colors.accent,
      cta: 'Register Now',
      ctaBg: colors.accent,
      ctaColor: colors.white,
    };
  }
  return {
    label: 'Open',
    badgeBg: colors.primaryLight + '20',
    badgeColor: colors.primaryLight,
    cta: 'Save Your Spot',
    ctaBg: colors.primary,
    ctaColor: colors.white,
  };
}

// ── Club detail modal (bottom sheet style) ──
function ClubCard({ club, onPress }: { club: typeof mockClubs[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.clubCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.clubEmojiWrap, { backgroundColor: colors.primary + '18' }]}>
        <Text style={styles.clubEmoji}>{club.emoji}</Text>
      </View>
      <Text style={styles.clubName} numberOfLines={2}>{club.name}</Text>
      <Text style={styles.clubCategory}>{club.category}</Text>
      <View style={styles.clubMemberRow}>
        <Text style={[styles.clubMembers, { color: colors.primary }]}>
          👥 {club.members}
        </Text>
      </View>
      <View style={[styles.clubMeetBadge, { backgroundColor: colors.primary + '12' }]}>
        <Text style={[styles.clubMeetText, { color: colors.primary }]}>
          {club.meets}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, { backgroundColor: colors.primary }]}
        onPress={onPress}
      >
        <Text style={styles.joinBtnText}>Join Club</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState<'events' | 'clubs'>('events');
  const [registeredIds, setRegisteredIds] = useState<string[]>(
    mockEvents.filter(e => e.registered).map(e => e.id)
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'All'
    ? mockEvents
    : mockEvents.filter(e => e.category === filter);

  const handleRegister = (event: typeof mockEvents[0]) => {
    const isRegistered = registeredIds.includes(event.id);
    if (isRegistered) {
      Alert.alert(
        'Already Registered',
        `You are registered for ${event.title}. Check your email for confirmation.`,
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      `Register for ${event.title}?`,
      `📅 ${event.date}\n🕐 ${event.time}\n📍 ${event.venue}\n\nYou will receive a confirmation on your college email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Registration',
          onPress: () => {
            setRegisteredIds(prev => [...prev, event.id]);
            Alert.alert('🎉 Registered!', `You're in for ${event.title}. See you there!`);
          },
        },
      ]
    );
  };

  const handleClubJoin = (club: typeof mockClubs[0]) => {
    Alert.alert(
      `Join ${club.name}?`,
      `📍 Meets: ${club.meets}\n👤 Lead: ${club.lead}\n\n${club.description}`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Send Join Request',
          onPress: () =>
            Alert.alert('Request Sent! 🎉', `Your request to join ${club.name} has been sent to ${club.lead}.`),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header stats ── */}
      <View style={styles.headerStats}>
        <View style={styles.statPill}>
          <Text style={styles.statNum}>{mockEvents.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {registeredIds.length}
          </Text>
          <Text style={styles.statLabel}>Registered</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statPill}>
          <Text style={styles.statNum}>{mockClubs.length}</Text>
          <Text style={styles.statLabel}>Clubs</Text>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'events' && styles.tabActive]}
          onPress={() => setTab('events')}
        >
          <Text style={[styles.tabText, tab === 'events' && styles.tabTextActive]}>
            🎉 Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'clubs' && styles.tabActive]}
          onPress={() => setTab('clubs')}
        >
          <Text style={[styles.tabText, tab === 'clubs' && styles.tabTextActive]}>
            🏛️ Clubs
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'events' ? (
        <>
          {/* ── Filter chips ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Event count ── */}
          <Text style={styles.resultCount}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            {filter !== 'All' ? ` in ${filter}` : ''}
          </Text>

          {/* ── Event cards ── */}
          <View style={styles.eventList}>
            {filtered.map(event => {
              const isRegistered = registeredIds.includes(event.id);
              const state = getEventState(
                event.startDate,
                event.registrationCloses,
                isRegistered
              );
              const isExpanded = expandedId === event.id;

              return (
                <View key={event.id} style={styles.eventCard}>

                  {/* Color header */}
                  <TouchableOpacity
                    style={[styles.eventHeader, { backgroundColor: colors.primary }]}
                    onPress={() => setExpandedId(isExpanded ? null : event.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.headerLeft}>
                      <Text style={styles.eventCategoryLabel}>{event.category.toUpperCase()}</Text>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDateText}>📅 {event.date}</Text>
                    </View>
                    <View>
                      <View style={[styles.stateBadge, { backgroundColor: state.badgeBg }]}>
                        <Text style={[styles.stateText, { color: state.badgeColor }]}>
                          {state.label}
                        </Text>
                      </View>
                      <Text style={styles.expandHint}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Body */}
                  <View style={styles.eventBody}>
                    {/* Quick info row */}
                    <View style={styles.quickInfoRow}>
                      <View style={styles.quickInfoItem}>
                        <Text style={styles.quickInfoIcon}>🕐</Text>
                        <Text style={styles.quickInfoText}>{event.time}</Text>
                      </View>
                      <View style={styles.quickInfoItem}>
                        <Text style={styles.quickInfoIcon}>📍</Text>
                        <Text style={styles.quickInfoText}>{event.venue}</Text>
                      </View>
                      <View style={styles.quickInfoItem}>
                        <Text style={styles.quickInfoIcon}>👥</Text>
                        <Text style={styles.quickInfoText}>{event.seats}</Text>
                      </View>
                    </View>

                    {/* Expanded description */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.eventDesc}>{event.description}</Text>
                        <Text style={styles.organizerText}>Organised by {event.organizer}</Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.venueBtn}
                        onPress={() =>
                          navigation.navigate('Map', {
                            focusBuildingName: event.venue,
                            source: 'event',
                          })
                        }
                      >
                        <Text style={styles.venueBtnText}>📍 Venue</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.registerBtn,
                          { backgroundColor: state.ctaBg },
                        ]}
                        onPress={() => handleRegister(event)}
                      >
                        <Text style={[styles.registerBtnText, { color: state.ctaColor }]}>
                          {state.cta}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        /* ── Clubs grid ── */
        <>
          <Text style={styles.resultCount}>{mockClubs.length} active clubs on campus</Text>
          <View style={styles.clubsGrid}>
            {mockClubs.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                onPress={() => handleClubJoin(club)}
              />
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header stats
  headerStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16,
    elevation: 2,
  },
  statPill: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },

  // Tabs
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    padding: 6, margin: 16, borderRadius: 14,
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  // Filters
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },

  resultCount: {
    fontSize: 13, color: colors.textSecondary,
    paddingHorizontal: 20, marginBottom: 12, fontWeight: '600',
  },

  // Event cards
  eventList: { paddingHorizontal: 16, gap: 14 },
  eventCard: {
    backgroundColor: colors.white, borderRadius: 18,
    overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10,
  },
  eventHeader: {
    padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, marginRight: 12 },
  eventCategoryLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.7)',
    fontWeight: '700', marginBottom: 4, letterSpacing: 1,
  },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  eventDateText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  stateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 6 },
  stateText: { fontSize: 11, fontWeight: '700' },
  expandHint: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  eventBody: { padding: 14 },
  quickInfoRow: { flexDirection: 'row', gap: 0, marginBottom: 12 },
  quickInfoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickInfoIcon: { fontSize: 13 },
  quickInfoText: { fontSize: 12, color: colors.textSecondary, flex: 1 },

  expandedContent: {
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 12, marginBottom: 12,
  },
  eventDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  organizerText: { fontSize: 12, color: colors.textLight, fontStyle: 'italic' },

  actionRow: { flexDirection: 'row', gap: 10 },
  venueBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  venueBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
  registerBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center',
  },
  registerBtnText: { fontSize: 13, fontWeight: '700' },

  // Clubs
  clubsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  clubCard: {
    width: '47%', backgroundColor: colors.white,
    borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 2,
  },
  clubEmojiWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  clubEmoji: { fontSize: 26 },
  clubName: {
    fontSize: 13, fontWeight: '700', color: colors.text,
    textAlign: 'center', marginBottom: 4,
  },
  clubCategory: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  clubMemberRow: { marginBottom: 8 },
  clubMembers: { fontSize: 12, fontWeight: '700' },
  clubMeetBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  clubMeetText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  joinBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, width: '100%', alignItems: 'center',
  },
  joinBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
