// Updated: 2026-04-05
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { fetchEvents, fetchClubs, EventItem, ClubItem } from '../services/firebaseData';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

const FILTERS = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

type AppNavigation = BottomTabNavigationProp<MainTabParamList>;
type EventsRoute = RouteProp<MainTabParamList, 'Events'>;

function getEventState(startDate: string, registrationCloses: string, registered: boolean) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const close = new Date(registrationCloses).getTime();

  if (registered) {
    return { label: 'You are in', tone: '#DCFCE7', text: colors.success, cta: 'View details' };
  }
  if (start - now <= 1000 * 60 * 60 * 24 * 2) {
    return { label: 'Starts soon', tone: '#FEF3C7', text: '#D97706', cta: 'Register now' };
  }
  if (close < now) {
    return { label: 'Registration closed', tone: '#F3F4F6', text: colors.textSecondary, cta: 'View event' };
  }
  return { label: 'Open for registration', tone: '#DBEAFE', text: colors.primary, cta: 'Save your spot' };
}

export default function EventsScreen() {
  const navigation = useNavigation<AppNavigation>();
  const route = useRoute<EventsRoute>();
  const [filter, setFilter] = useState(route.params?.initialFilter ?? 'All');
  const [tab, setTab] = useState<'events' | 'clubs'>(route.params?.initialTab ?? 'events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, clubsData] = await Promise.all([
          fetchEvents(),
          fetchClubs(),
        ]);
        setEvents(eventsData);
        setClubs(clubsData);
      } catch (error) {
        console.error('Error loading events data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.initialFilter) {
      setFilter(route.params.initialFilter);
    }
    if (route.params?.initialTab) {
      setTab(route.params.initialTab);
    }
  }, [route.params?.initialFilter, route.params?.initialTab]);

  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);
  const highlightedEventId = route.params?.highlightEventId;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Discover What Fits You</Text>
        <Text style={styles.heroTitle}>Events should help students act fast, not scroll endlessly.</Text>
        <Text style={styles.heroText}>Use filters to narrow down opportunities, then jump to registration or venue details in one tap.</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'events' && styles.tabActive]} onPress={() => setTab('events')}>
          <Text style={[styles.tabText, tab === 'events' && styles.tabTextActive]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'clubs' && styles.tabActive]} onPress={() => setTab('clubs')}>
          <Text style={[styles.tabText, tab === 'clubs' && styles.tabTextActive]}>Clubs</Text>
        </TouchableOpacity>
      </View>

      {tab === 'events' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.eventList}>
            {filtered.map(event => {
              const state = getEventState(event.startDate, event.registrationCloses, event.registered);

              return (
                <View
                  key={event.id}
                  style={[styles.eventCard, highlightedEventId === event.id && styles.eventCardActive]}
                >
                  <View style={[styles.eventHeader, { backgroundColor: event.color }]}>
                    <View style={styles.headerTextWrap}>
                      <Text style={styles.eventCategory}>{event.category}</Text>
                      <Text style={styles.eventTitle}>{event.title.replace('2025', '2026')}</Text>
                      <Text style={styles.eventDate}>{event.date}</Text>
                    </View>
                    <View style={[styles.stateBadge, { backgroundColor: state.tone }]}>
                      <Text style={[styles.stateText, { color: state.text }]}>{state.label}</Text>
                    </View>
                  </View>

                  <View style={styles.eventBody}>
                    <View style={styles.eventMeta}>
                      <Text style={styles.metaItem}>Time: {event.time}</Text>
                      <Text style={styles.metaItem}>Seats: {event.seats}</Text>
                    </View>
                    <Text style={styles.metaItem}>Venue: {event.venue}</Text>
                    <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                    <View style={styles.eventFooter}>
                      <Text style={styles.organizer}>by {event.organizer}</Text>
                      <View style={styles.footerActions}>
                        <TouchableOpacity
                          style={styles.secondaryBtn}
                          onPress={() => navigation.navigate('Map', {
                            focusBuildingId: event.venueBuildingId,
                            focusRoom: event.venue,
                            source: event.title,
                          })}
                        >
                          <Text style={styles.secondaryBtnText}>Venue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.regBtn, { backgroundColor: event.registered ? '#F3F4F6' : event.color }]}
                        >
                          <Text style={[styles.regBtnText, { color: event.registered ? colors.textSecondary : colors.white }]}>
                            {state.cta}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.clubsGrid}>
          {clubs.map(club => (
            <TouchableOpacity key={club.id} style={styles.clubCard} activeOpacity={0.8}>
              <View style={[styles.clubEmoji, { backgroundColor: club.color + '18' }]}>
                <Text style={styles.clubEmojiText}>{club.emoji}</Text>
              </View>
              <Text style={styles.clubName} numberOfLines={2}>{club.name}</Text>
              <Text style={styles.clubCategory}>{club.category}</Text>
              <Text style={[styles.clubMembers, { color: club.color }]}>{club.members} members</Text>
              <TouchableOpacity style={[styles.joinBtn, { borderColor: club.color }]}>
                <Text style={[styles.joinText, { color: club.color }]}>View Club</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroEyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: colors.text, lineHeight: 24 },
  heroText: { marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 8,
    margin: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  eventList: { paddingHorizontal: 16, gap: 16 },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  eventCardActive: { borderColor: colors.primary },
  eventHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  headerTextWrap: { flex: 1 },
  eventCategory: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  eventDate: { marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  stateBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  stateText: { fontSize: 11, fontWeight: '700' },
  eventBody: { padding: 16 },
  eventMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { fontSize: 12, color: colors.textSecondary },
  eventDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginVertical: 10 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  organizer: { flex: 1, fontSize: 12, color: colors.textLight, fontStyle: 'italic' },
  footerActions: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  regBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  regBtnText: { fontSize: 13, fontWeight: '700' },
  clubsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  clubCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  clubEmoji: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  clubEmojiText: { fontSize: 26 },
  clubName: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 4 },
  clubCategory: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  clubMembers: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  joinBtn: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  joinText: { fontSize: 12, fontWeight: '700' },
});
