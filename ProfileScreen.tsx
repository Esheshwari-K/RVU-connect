// Updated: 2026-04-05
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { mockUser, mockStats, mockAttendance } from '../data/mockData';

export default function ProfileScreen() {
  const infoRows = [
    { label: 'USN', value: mockUser.usn },
    { label: 'Branch', value: mockUser.branch },
    { label: 'Semester', value: mockUser.semester },
    { label: 'Section', value: mockUser.section },
    { label: 'Date of Birth', value: mockUser.dob },
    { label: 'Email', value: mockUser.email },
    { label: 'Phone', value: mockUser.phone },
    { label: 'Hostel', value: mockUser.hostel },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{mockUser.avatar}</Text>
        </View>
        <Text style={styles.name}>{mockUser.name}</Text>
        <Text style={styles.branch}>{mockUser.branch}</Text>
        <Text style={styles.semester}>{mockUser.semester} · {mockUser.year}</Text>
        <View style={styles.usnBadge}>
          <Text style={styles.usnText}>🎓 {mockUser.usn}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {mockStats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Attendance breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Breakdown</Text>
        {mockAttendance.map(item => {
          const pct = Math.round((item.attended / item.total) * 100);
          return (
            <View key={item.subject} style={styles.attRow}>
              <View style={styles.attLeft}>
                <Text style={styles.attSubject}>{item.subject}</Text>
                <Text style={styles.attCount}>{item.attended}/{item.total} classes</Text>
              </View>
              <View style={styles.attRight}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.attPct, { color: item.color }]}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Student info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.infoCard}>
          {infoRows.map((row, idx) => (
            <View key={row.label} style={[styles.infoRow, idx < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileCard: {
    backgroundColor: colors.primary, alignItems: 'center',
    paddingTop: 32, paddingBottom: 36, paddingHorizontal: 24,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.accent, justifyContent: 'center',
    alignItems: 'center', marginBottom: 14,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: colors.white },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.white, marginBottom: 4 },
  branch: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 2 },
  semester: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  usnBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 20,
  },
  usnText: { fontSize: 13, color: colors.white, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: -16,
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  attRow: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    elevation: 1,
  },
  attLeft: { flex: 1 },
  attSubject: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2 },
  attCount: { fontSize: 11, color: colors.textSecondary },
  attRight: { alignItems: 'flex-end', gap: 6 },
  progressBg: { width: 80, height: 6, backgroundColor: colors.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  attPct: { fontSize: 13, fontWeight: 'bold' },
  infoCard: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  infoRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 13, justifyContent: 'space-between' },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 2, textAlign: 'right' },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 24, borderWidth: 1.5,
    borderColor: colors.danger, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
