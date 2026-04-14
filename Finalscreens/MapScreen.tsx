import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Dimensions, Animated, Alert,
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const BUILDINGS = [
  {
    id: '1', name: 'Main Block', code: 'MB',
    description: 'Admin, Principal Office, HODs, Exam Cell',
    floor: '4 floors', category: 'Academic',
    color: '#1A3C6E', emoji: '🏛️',
    x: 0.35, y: 0.18,
    directions: 'Enter from main gate → straight ahead → cannot miss it',
  },
  {
    id: '2', name: 'Grand Stairs', code: 'GS',
    description: 'Main staircase and central campus access point',
    floor: 'Open access', category: 'Facility',
    color: '#3B82F6', emoji: '💻',
    x: 0.65, y: 0.22,
    directions: 'From Main Block → head right to the large central staircase',
  },
  {
    id: '3', name: 'A Block', code: 'A',
    description: 'Academic classrooms and faculty rooms',
    floor: '3 floors', category: 'Academic',
    color: '#10B981', emoji: '📚',
    x: 0.18, y: 0.42,
    directions: 'From Main Block → turn left and walk toward A Block',
  },
  {
    id: '4', name: 'B Block', code: 'B',
    description: 'Academic classrooms, labs, and department rooms',
    floor: '3 floors', category: 'Academic',
    color: '#F59E0B', emoji: '⚙️',
    x: 0.62, y: 0.48,
    directions: 'From Grand Stairs → continue ahead to reach B Block',
  },
  {
    id: '5', name: 'D Block', code: 'D',
    description: 'Academic classrooms and department spaces',
    floor: '3 floors', category: 'Academic',
    color: '#EF4444', emoji: '🍽️',
    x: 0.38, y: 0.62,
    directions: 'From the central road → move south-west toward D Block',
  },
  {
    id: '6', name: 'C Block', code: 'C',
    description: 'Academic classrooms and labs',
    floor: '3 floors', category: 'Academic',
    color: '#8B5CF6', emoji: '⚽',
    x: 0.72, y: 0.68,
    directions: 'From B Block → walk further down the road to C Block',
  },
  {
    id: '7', name: 'Canteen', code: 'CAN',
    description: 'Food court, cafeteria, and snack counters',
    floor: '1 floor', category: 'Facility',
    color: '#EC4899', emoji: '🎭',
    x: 0.18, y: 0.72,
    directions: 'From the centre of campus → follow the food court signs',
  },
  {
    id: '8', name: 'Library', code: 'LIB',
    description: 'Central library, digital resources, and reading rooms',
    floor: '2 floors', category: 'Resource',
    color: '#06B6D4', emoji: '🏠',
    x: 0.78, y: 0.32,
    directions: 'From Main Block → turn left and continue to the Library',
  },
  {
    id: '9', name: 'Auditorium', code: 'AUD',
    description: 'Event hall, presentations, and campus gatherings',
    floor: '2 floors', category: 'Events',
    color: '#F4A020', emoji: '🚀',
    x: 0.48, y: 0.38,
    directions: 'From the Library → walk south toward the large event hall',
  },
  {
    id: '10', name: 'SOCSE Block', code: 'SOCSE',
    description: 'School of Computer Science and Engineering block',
    floor: '3 floors', category: 'Academic',
    color: '#14B8A6', emoji: '🧑‍💻',
    x: 0.84, y: 0.52,
    directions: 'From Grand Stairs → head right and continue to SOCSE Block',
  },
];

const CATEGORIES = ['All', 'Academic', 'Resource', 'Facility', 'Sports', 'Events'];
const CATEGORY_COLORS: Record<string, string> = {
  Academic: colors.primary, Resource: colors.primaryLight,
  Facility: colors.accent, Sports: colors.success,
  Events: colors.warning, Residential: colors.danger,
};

const MAP_W = width - 32;
const MAP_H = MAP_W * 1.05;

export default function MapScreen() {
  const [selected, setSelected] = useState<typeof BUILDINGS[0] | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [navigating, setNavigating] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;
  const scaleAnims = useRef(BUILDINGS.map(() => new Animated.Value(1))).current;

  const filtered = BUILDINGS.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || b.category === category;
    return matchSearch && matchCat;
  });

  const selectBuilding = (building: typeof BUILDINGS[0], idx: number) => {
    setSelected(building);
    setNavigating(false);
    // Animate the selected building
    Animated.sequence([
      Animated.timing(scaleAnims[idx], { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnims[idx], { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    // Slide up info card
    Animated.spring(slideAnim, {
      toValue: 0, tension: 80, friction: 10, useNativeDriver: true,
    }).start();
  };

  const clearSelection = () => {
    Animated.timing(slideAnim, {
      toValue: 200, duration: 200, useNativeDriver: true,
    }).start(() => { setSelected(null); setNavigating(false); });
  };

  const handleNavigate = () => {
    setNavigating(true);
    Alert.alert(
      `🗺️ Directions to ${selected?.name}`,
      selected?.directions,
      [{ text: 'Got it!', onPress: () => setNavigating(false) }]
    );
  };

  return (
    <View style={styles.container}>

      {/* ── Search bar ── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search buildings, labs, canteen..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={t => { setSearch(t); setSelected(null); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category filter ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Campus map ── */}
        <View style={styles.mapWrap}>
          <View style={[styles.mapBoard, { width: MAP_W, height: MAP_H }]}>

            {/* Background zones */}
            <View style={[styles.zone, { top: '5%', left: '5%', width: '90%', height: '90%', backgroundColor: '#E8F5E9', borderRadius: 20 }]} />
            <View style={[styles.zone, { top: '15%', left: '10%', width: '80%', height: '70%', backgroundColor: '#F1F8E9', borderRadius: 16 }]} />

            {/* Roads */}
            <View style={[styles.road, { top: '50%', left: '5%', right: '5%', height: 10 }]} />
            <View style={[styles.road, { left: '48%', top: '10%', bottom: '10%', width: 10 }]} />
            <View style={[styles.road, { top: '25%', left: '5%', right: '5%', height: 6, opacity: 0.5 }]} />

            {/* Green areas */}
            <View style={[styles.greenArea, { top: '52%', left: '28%', width: 70, height: 50 }]} />
            <View style={[styles.greenArea, { top: '20%', left: '22%', width: 50, height: 40 }]} />

            {/* Main gate */}
            <View style={styles.gateMarker}>
              <Text style={styles.gateText}>🚪 Main Gate</Text>
            </View>

            {/* Building pins */}
            {BUILDINGS.map((b, idx) => {
              const isFiltered = filtered.some(f => f.id === b.id);
              const isSelected = selected?.id === b.id;
              if (!isFiltered && search.length > 0) return null;
              if (!isFiltered && category !== 'All') return null;

              return (
                <Animated.View
                  key={b.id}
                  style={[
                    styles.pinWrap,
                    {
                      left: b.x * MAP_W - 30,
                      top: b.y * MAP_H - 30,
                      transform: [{ scale: scaleAnims[idx] }],
                      zIndex: isSelected ? 10 : 1,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.pin,
                      { backgroundColor: colors.primary },
                      isSelected && styles.pinSelected,
                    ]}
                    onPress={() => selectBuilding(b, idx)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.pinEmoji}>{b.emoji}</Text>
                  </TouchableOpacity>
                  {isSelected && (
                    <View style={[styles.pinLabel, { backgroundColor: colors.primary }]}>
                      <Text style={styles.pinLabelText}>{b.name}</Text>
                    </View>
                  )}
                </Animated.View>
              );
            })}

            {/* You are here */}
            <View style={[styles.youHere, { left: '47%', top: '49%' }]}>
              <View style={styles.youDot} />
              <View style={styles.youRing} />
              <Text style={styles.youText}>You</Text>
            </View>

            {/* Map legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>RVU Campus</Text>
              <Text style={styles.legendSub}>Tap a building</Text>
            </View>
          </View>
        </View>

        {/* ── Selected building info card ── */}
        {selected && (
          <Animated.View style={[styles.infoCard, { transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.infoHeader, { backgroundColor: colors.primary }]}>
              <View>
                <Text style={styles.infoEmoji}>{selected.emoji}</Text>
                <Text style={styles.infoName}>{selected.name}</Text>
                <Text style={styles.infoCategory}>{selected.category} · {selected.floor}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={clearSelection}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoDesc}>{selected.description}</Text>
              <View style={styles.infoActions}>
                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.primary }]}
                  onPress={handleNavigate}
                >
                  <Text style={styles.navBtnText}>
                    {navigating ? '🧭 Navigating...' : '🗺️ Get Directions'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── Search results list ── */}
        {search.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Text>
            {filtered.map(b => (
              <TouchableOpacity
                key={b.id}
                style={styles.resultRow}
                onPress={() => { selectBuilding(b, BUILDINGS.indexOf(b)); setSearch(''); }}
              >
                <View style={[styles.resultIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={{ fontSize: 20 }}>{b.emoji}</Text>
                </View>
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>{b.name}</Text>
                  <Text style={styles.resultDesc} numberOfLines={1}>{b.description}</Text>
                </View>
                <Text style={[styles.resultCat, { color: colors.primary }]}>{b.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Building directory ── */}
        {search.length === 0 && (
          <View style={styles.directory}>
            <Text style={styles.directoryTitle}>Campus Directory</Text>
            {BUILDINGS.map((b, idx) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.dirRow, selected?.id === b.id && { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
                onPress={() => selectBuilding(b, idx)}
              >
                <View style={[styles.dirIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={{ fontSize: 18 }}>{b.emoji}</Text>
                </View>
                <View style={styles.dirText}>
                  <Text style={styles.dirName}>{b.name}</Text>
                  <Text style={styles.dirDesc} numberOfLines={1}>{b.description}</Text>
                </View>
                <View>
                  <View style={[styles.dirCatBadge, { backgroundColor: (CATEGORY_COLORS[b.category] ?? '#888') + '18' }]}>
                    <Text style={[styles.dirCatText, { color: CATEGORY_COLORS[b.category] ?? '#888' }]}>
                      {b.category}
                    </Text>
                  </View>
                  <Text style={styles.dirFloor}>{b.floor}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, margin: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  clearBtn: { fontSize: 16, color: colors.textLight, padding: 4 },

  // Category filter
  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
    minHeight: 42,
    justifyContent: 'center',
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catTextActive: { color: colors.white },

  // Map
  mapWrap: { paddingHorizontal: 16, marginBottom: 8 },
  mapBoard: {
    backgroundColor: '#E8F5E9', borderRadius: 20,
    overflow: 'hidden', position: 'relative',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10,
  },
  zone: { position: 'absolute' },
  road: { position: 'absolute', backgroundColor: '#B0BEC5', borderRadius: 4 },
  greenArea: {
    position: 'absolute', backgroundColor: '#A5D6A7',
    borderRadius: 10, opacity: 0.7,
  },
  gateMarker: {
    position: 'absolute', bottom: '5%', left: '38%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  gateText: { fontSize: 10, fontWeight: '700', color: colors.text },
  pinWrap: { position: 'absolute', alignItems: 'center' },
  pin: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  pinSelected: { borderWidth: 3, borderColor: '#fff', elevation: 8 },
  pinEmoji: { fontSize: 20 },
  pinLabel: {
    marginTop: 4, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  pinLabelText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  youHere: { position: 'absolute', alignItems: 'center' },
  youDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#2196F3', borderWidth: 2, borderColor: '#fff',
    elevation: 4,
  },
  youRing: {
    position: 'absolute', width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#2196F366',
  },
  youText: { fontSize: 9, color: '#1A3C6E', fontWeight: 'bold', marginTop: 2 },
  legend: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  legendTitle: { fontSize: 11, fontWeight: '800', color: colors.text },
  legendSub: { fontSize: 9, color: colors.textSecondary },

  // Info card
  infoCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: colors.white, borderRadius: 18,
    overflow: 'hidden', elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  infoHeader: {
    padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  infoEmoji: { fontSize: 28, marginBottom: 6 },
  infoName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  infoCategory: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  infoBody: { padding: 14 },
  infoDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 14 },
  infoActions: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center',
  },
  navBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  shareBtn: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  shareBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },

  // Search results
  resultsSection: { paddingHorizontal: 16, marginBottom: 16 },
  resultsTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12,
    padding: 12, marginBottom: 8, elevation: 1,
  },
  resultIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultText: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '700', color: colors.text },
  resultDesc: { fontSize: 12, color: colors.textSecondary },
  resultCat: { fontSize: 11, fontWeight: '600' },

  // Directory
  directory: { paddingHorizontal: 16 },
  directoryTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  dirRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'transparent', elevation: 1,
  },
  dirIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dirText: { flex: 1 },
  dirName: { fontSize: 14, fontWeight: '700', color: colors.text },
  dirDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  dirCatBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 4 },
  dirCatText: { fontSize: 10, fontWeight: '700' },
  dirFloor: { fontSize: 10, color: colors.textLight, textAlign: 'right' },
});
