// Updated: 2026-04-05
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions, TextInput,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { mockClasses } from '../data/mockData';
import type { MainTabParamList } from '../navigation/MainTabNavigator';

const { width } = Dimensions.get('window');

const BUILDINGS = [
  {
    id: '1',
    name: 'Main Block',
    code: 'MB',
    description: 'Admin, principal office, halls and seminar spaces',
    floor: '4 floors',
    color: '#1A3C6E',
    x: 0.3,
    y: 0.15,
    rooms: ['Main Block Hall 1', 'Main Block Hall 2', 'Seminar Hall A', 'Innovation Hub'],
  },
  {
    id: '2',
    name: 'CS & IT Block',
    code: 'CSE',
    description: 'CS, IT, MCA departments and classrooms',
    floor: '3 floors',
    color: '#3B82F6',
    x: 0.6,
    y: 0.2,
    rooms: ['CS-101', 'CS-102', 'CS-203', 'CS-204', 'ML-Lab', 'DS-Lab', 'Net-Lab'],
  },
  {
    id: '3',
    name: 'Library',
    code: 'LIB',
    description: 'Central library and reading rooms',
    floor: '2 floors',
    color: '#10B981',
    x: 0.15,
    y: 0.4,
    rooms: ['Issue Counter', 'Silent Reading Hall'],
  },
  {
    id: '4',
    name: 'Mechanical Block',
    code: 'ME',
    description: 'Mechanical and civil departments',
    floor: '3 floors',
    color: '#F59E0B',
    x: 0.55,
    y: 0.45,
    rooms: ['Workshop Lab'],
  },
  {
    id: '5',
    name: 'Canteen',
    code: 'CAF',
    description: 'Food court and cafeteria',
    floor: '1 floor',
    color: '#EF4444',
    x: 0.3,
    y: 0.6,
    rooms: ['Food Court'],
  },
  {
    id: '6',
    name: 'Sports Complex',
    code: 'SP',
    description: 'Ground and indoor stadium',
    floor: 'Open',
    color: '#8B5CF6',
    x: 0.7,
    y: 0.65,
    rooms: ['Indoor Stadium', 'Basketball Court'],
  },
  {
    id: '7',
    name: 'Auditorium',
    code: 'AUD',
    description: 'Main auditorium and open air event spaces',
    floor: '2 floors',
    color: '#EC4899',
    x: 0.15,
    y: 0.72,
    rooms: ['Main Auditorium', 'Open Air Theatre'],
  },
  {
    id: '8',
    name: 'Hostel Block',
    code: 'HST',
    description: 'Boys and girls hostels',
    floor: '5 floors',
    color: '#06B6D4',
    x: 0.75,
    y: 0.3,
    rooms: ['Boys Hostel', 'Girls Hostel'],
  },
];

const QUICK_LINKS = [
  { label: 'Next class', target: 'next-class', color: '#1A3C6E' },
  { label: 'Library', target: '3', color: '#10B981' },
  { label: 'Canteen', target: '5', color: '#EF4444' },
  { label: 'Auditorium', target: '7', color: '#EC4899' },
  { label: 'Sports', target: '6', color: '#8B5CF6' },
];

const MAP_W = width - 32;
const MAP_H = MAP_W * 1.1;

type MapRoute = RouteProp<MainTabParamList, 'Map'>;

export default function MapScreen() {
  const route = useRoute<MapRoute>();
  const [selected, setSelected] = useState<typeof BUILDINGS[0] | null>(null);
  const [query, setQuery] = useState('');

  const nextClass = mockClasses.find(cls => !cls.done) ?? mockClasses[mockClasses.length - 1];

  useEffect(() => {
    const focusBuilding = BUILDINGS.find(building => building.id === route.params?.focusBuildingId)
      ?? BUILDINGS.find(building => building.name.toLowerCase() === route.params?.focusBuildingName?.toLowerCase())
      ?? BUILDINGS.find(building => building.rooms.some(room => room.toLowerCase() === route.params?.focusRoom?.toLowerCase()));

    if (focusBuilding) {
      setSelected(focusBuilding);
      if (route.params?.focusRoom) {
        setQuery(route.params.focusRoom);
      } else {
        setQuery(focusBuilding.name);
      }
    }
  }, [route.params?.focusBuildingId, route.params?.focusBuildingName, route.params?.focusRoom]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return BUILDINGS;
    }

    return BUILDINGS.filter(building =>
      building.name.toLowerCase().includes(normalized)
      || building.code.toLowerCase().includes(normalized)
      || building.description.toLowerCase().includes(normalized)
      || building.rooms.some(room => room.toLowerCase().includes(normalized)));
  }, [query]);

  const activeRoom = selected?.rooms.find(room => room.toLowerCase().includes(query.trim().toLowerCase()));

  const focusBuilding = (buildingId: string) => {
    const building = BUILDINGS.find(item => item.id === buildingId);
    if (building) {
      setSelected(building);
      setQuery(building.name);
    }
  };

  const handleQuickLink = (target: string) => {
    if (target === 'next-class') {
      const nextBuilding = BUILDINGS.find(item => item.id === nextClass.buildingId);
      if (nextBuilding) {
        setSelected(nextBuilding);
        setQuery(nextClass.room);
      }
      return;
    }

    focusBuilding(target);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Find a place fast</Text>
        <Text style={styles.searchSubtitle}>Search by building, room, or what the student actually remembers.</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Try CS-101, library, seminar hall..."
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {QUICK_LINKS.map(q => (
          <TouchableOpacity key={q.label} style={[styles.quickChip, { borderColor: q.color + '40' }]} onPress={() => handleQuickLink(q.target)}>
            <View style={[styles.quickDot, { backgroundColor: q.color }]} />
            <Text style={styles.quickLabel}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {route.params?.source && selected && (
        <View style={styles.contextCard}>
          <Text style={styles.contextEyebrow}>Opened from {route.params.source}</Text>
          <Text style={styles.contextTitle}>{selected.name}</Text>
          <Text style={styles.contextText}>
            {route.params.focusRoom
              ? `Room hint: ${route.params.focusRoom}`
              : 'Use the building card below to orient the user quickly.'}
          </Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>RV University Campus</Text>
        <Text style={styles.mapSubtitle}>Focus the map around tasks, not just landmarks.</Text>

        <View style={[styles.mapBoard, { width: MAP_W, height: MAP_H }]}>
          <View style={[styles.road, { top: '50%', left: 0, right: 0, height: 8 }]} />
          <View style={[styles.road, { left: '45%', top: 0, bottom: 0, width: 8 }]} />
          <View style={[styles.greenArea, { top: '25%', left: '20%', width: 80, height: 60 }]} />
          <View style={[styles.greenArea, { top: '65%', left: '35%', width: 100, height: 50 }]} />

          {BUILDINGS.map(b => {
            const dimmed = query.trim().length > 0 && !matches.some(match => match.id === b.id);
            const focused = selected?.id === b.id;

            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.buildingPin,
                  {
                    left: b.x * MAP_W - 28,
                    top: b.y * MAP_H - 28,
                    backgroundColor: focused ? b.color : b.color + (dimmed ? '55' : 'DD'),
                    transform: [{ scale: focused ? 1.15 : 1 }],
                    borderWidth: focused ? 3 : 0,
                    borderColor: '#fff',
                  },
                ]}
                onPress={() => setSelected(selected?.id === b.id ? null : b)}
              >
                <Text style={styles.pinCode}>{b.code}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={[styles.youAreHere, { left: '44%', top: '49%' }]}>
            <View style={styles.youDot} />
            <Text style={styles.youText}>You</Text>
          </View>
        </View>

        {selected && (
          <View style={[styles.infoCard, { borderLeftColor: selected.color }]}>
            <View style={styles.infoTop}>
              <View style={[styles.infoBadge, { backgroundColor: selected.color }]}>
                <Text style={styles.infoBadgeText}>{selected.code}</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoName}>{selected.name}</Text>
                <Text style={styles.infoDesc}>{selected.description}</Text>
              </View>
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoMetaText}>{selected.floor}</Text>
              <Text style={styles.infoMetaText}>{activeRoom ?? selected.rooms[0]}</Text>
            </View>
            <View style={styles.roomList}>
              {selected.rooms.slice(0, 3).map(room => (
                <Text key={room} style={[styles.roomChip, activeRoom === room && styles.roomChipActive]}>
                  {room}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Matching Places</Text>
        {matches.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[styles.buildingRow, selected?.id === b.id && { backgroundColor: b.color + '10', borderColor: b.color }]}
            onPress={() => setSelected(selected?.id === b.id ? null : b)}
          >
            <View style={[styles.buildingDot, { backgroundColor: b.color }]}>
              <Text style={styles.buildingDotText}>{b.code}</Text>
            </View>
            <View style={styles.buildingInfo}>
              <Text style={styles.buildingName}>{b.name}</Text>
              <Text style={styles.buildingDesc}>{b.description}</Text>
              <Text style={styles.buildingHint}>{b.rooms.slice(0, 2).join(' • ')}</Text>
            </View>
            <Text style={styles.buildingFloor}>{b.floor}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  searchSubtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 6 },
  searchInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  quickRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  quickDot: { width: 10, height: 10, borderRadius: 5 },
  quickLabel: { fontSize: 12, color: colors.text, fontWeight: '700' },
  contextCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  contextEyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  contextTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  contextText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  mapContainer: { marginHorizontal: 16, marginBottom: 20 },
  mapTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 2 },
  mapSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  mapBoard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  road: { position: 'absolute', backgroundColor: '#CFD8DC', opacity: 0.8 },
  greenArea: { position: 'absolute', backgroundColor: '#A5D6A7', borderRadius: 12, opacity: 0.6 },
  buildingPin: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pinCode: { fontSize: 10, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  youAreHere: { position: 'absolute', alignItems: 'center' },
  youDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#fff',
  },
  youText: { fontSize: 9, color: '#1A3C6E', fontWeight: 'bold', marginTop: 2 },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderLeftWidth: 4,
    elevation: 3,
  },
  infoTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  infoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  infoText: { flex: 1 },
  infoName: { fontSize: 15, fontWeight: '700', color: colors.text },
  infoDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  infoMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoMetaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  roomList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  roomChip: {
    fontSize: 11,
    color: colors.textSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  roomChipActive: { color: colors.white, backgroundColor: colors.primary },
  section: { marginHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 1,
  },
  buildingDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buildingDotText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  buildingInfo: { flex: 1 },
  buildingName: { fontSize: 14, fontWeight: '700', color: colors.text },
  buildingDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  buildingHint: { fontSize: 11, color: colors.primary, marginTop: 4 },
  buildingFloor: { fontSize: 11, color: colors.textLight },
});
