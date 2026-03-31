import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { mockEvents, mockClubs } from '../data/mockData';

const FILTERS = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

export default function EventsScreen() {
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState<'events' | 'clubs'>('events');

  const filtered = filter === 'All' ? mockEvents : mockEvents.filter(e => e.category === filter);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'events' && styles.tabActive]} onPress={() => setTab('events')}>
          <Text style={[styles.tabText, tab === 'events' && styles.tabTextActive]}>🎉 Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'clubs' && styles.tabActive]} onPress={() => setTab('clubs')}>
          <Text style={[styles.tabText, tab === 'clubs' && styles.tabTextActive]}>🏛️ Clubs</Text>
        </TouchableOpacity>
      </View>

      {tab === 'events' ? (
        <>
          {/* Filter chips */}
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

          {/* Event cards */}
          <View style={styles.eventList}>
            {filtered.map(event => (
              <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.85}>
                {/* Color header */}
                <View style={[styles.eventHeader, { backgroundColor: event.color }]}>
                  <View>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                  </View>
                  {event.registered && (
                    <View style={styles.registeredBadge}>
                      <Text style={styles.registeredText}>✓ Registered</Text>
                    </View>
                  )}
                </View>
                {/* Body */}
                <View style={styles.eventBody}>
                  <View style={styles.eventMeta}>
                    <Text style={styles.metaItem}>📅 {event.date}</Text>
                    <Text style={styles.metaItem}>🕐 {event.time}</Text>
                  </View>
                  <View style={styles.eventMeta}>
                    <Text style={styles.metaItem}>📍 {event.venue}</Text>
                    <Text style={styles.metaItem}>👥 {event.seats}</Text>
                  </View>
                  <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                  <View style={styles.eventFooter}>
                    <Text style={styles.organizer}>by {event.organizer}</Text>
                    <TouchableOpacity style={[styles.regBtn, { backgroundColor: event.registered ? '#F3F4F6' : event.color }]}>
                      <Text style={[styles.regBtnText, { color: event.registered ? colors.textSecondary : colors.white }]}>
                        {event.registered ? 'Registered' : 'Register Now'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        /* Clubs grid */
        <View style={styles.clubsGrid}>
          {mockClubs.map(club => (
            <TouchableOpacity key={club.id} style={styles.clubCard} activeOpacity={0.8}>
              <View style={[styles.clubEmoji, { backgroundColor: club.color + '18' }]}>
                <Text style={styles.clubEmojiText}>{club.emoji}</Text>
              </View>
              <Text style={styles.clubName} numberOfLines={2}>{club.name}</Text>
              <Text style={styles.clubCategory}>{club.category}</Text>
              <Text style={[styles.clubMembers, { color: club.color }]}>👥 {club.members} members</Text>
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
  tabRow: {
    flexDirection: 'row', backgroundColor: colors.white,
    padding: 8, margin: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  eventList: { paddingHorizontal: 16, gap: 16 },
  eventCard: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10,
  },
  eventHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventCategory: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  registeredBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  registeredText: { fontSize: 12, color: colors.white, fontWeight: '700' },
  eventBody: { padding: 16 },
  eventMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { fontSize: 12, color: colors.textSecondary },
  eventDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginVertical: 10 },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  organizer: { fontSize: 12, color: colors.textLight, fontStyle: 'italic' },
  regBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  regBtnText: { fontSize: 13, fontWeight: '700' },
  clubsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  clubCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: 16, padding: 16,
    alignItems: 'center', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  clubEmoji: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  clubEmojiText: { fontSize: 26 },
  clubName: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 4 },
  clubCategory: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  clubMembers: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  joinBtn: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  joinText: { fontSize: 12, fontWeight: '700' },
});