// Updated: 2026-04-05
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { mockUser } from '../data/mockData';
import { fetchUserProfile, fetchUserStats, fetchAttendanceRecords, updateUserProfile, UserProfile, StatsItem, AttendanceRecord } from '../services/firebaseData';
import { signOutCurrentUser } from '../firebase/firebase';

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(mockUser);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, statsData, attendanceData] = await Promise.all([
          fetchUserProfile(),
          fetchUserStats(),
          fetchAttendanceRecords(),
        ]);
        setUser(userData);
        setEditProfile(userData);
        setStats(statsData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: colors.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  const profile = user ?? mockUser;
  const infoRows = [
    { label: 'USN', value: profile.usn },
    { label: 'Branch', value: profile.branch },
    { label: 'Semester', value: profile.semester },
    { label: 'Section', value: profile.section },
    { label: 'Date of Birth', value: profile.dob },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'Hostel', value: profile.hostel },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.avatar}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.branch}>{profile.branch}</Text>
        <Text style={styles.semester}>{profile.semester} · {profile.year}</Text>
        <View style={styles.usnBadge}>
          <Text style={styles.usnText}>🎓 {profile.usn}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Attendance breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Breakdown</Text>
        {attendance.map(item => {
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <TouchableOpacity onPress={() => {
            if (editing) {
              setEditing(false);
              setEditProfile(profile);
            } else {
              setEditing(true);
            }
          }}>
            <Text style={styles.editButton}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {editing ? (
            <>
              {['name', 'usn', 'branch', 'semester', 'year', 'section', 'phone', 'dob', 'hostel', 'email'].map((field) => {
                const key = field as keyof UserProfile;
                return (
                  <View key={field} style={[styles.infoRow, field !== 'email' && styles.infoRowBorder]}>
                    <Text style={styles.infoLabel}>{field === 'name' ? 'Full Name' : field === 'usn' ? 'USN' : field === 'dob' ? 'Date of Birth' : field === 'hostel' ? 'Hostel' : field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                    <TextInput
                      style={[styles.infoValue, styles.editInput]}
                      value={String(editProfile[key] ?? '')}
                      onChangeText={(text) => setEditProfile(prev => ({ ...prev, [key]: text }))}
                      editable={field !== 'email'}
                      placeholder={field === 'email' ? 'Email cannot be changed' : undefined}
                    />
                  </View>
                );
              })}
            </>
          ) : (
            infoRows.map((row, idx) => (
              <View key={row.label} style={[styles.infoRow, idx < infoRows.length - 1 && styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
              </View>
            ))
          )}
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={async () => {
            setSaving(true);
            try {
              const updatedProfile = await updateUserProfile(editProfile);
              setUser(updatedProfile);
              setEditProfile(updatedProfile);
              setEditing(false);
              Alert.alert('Profile updated', 'Your profile information has been saved.');
            } catch (error) {
              console.error('Error saving profile:', error);
              Alert.alert('Save failed', 'Unable to update profile. Please try again later.');
            } finally {
              setSaving(false);
            }
          }} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
        try {
          await signOutCurrentUser();
        } catch (error) {
          console.error('Error signing out:', error);
          Alert.alert('Logout failed', 'Unable to sign out right now.');
        }
      }}>
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
  infoRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 13, justifyContent: 'space-between', alignItems: 'center' },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 2, textAlign: 'right' },
  editInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 8, textAlign: 'right', minWidth: 140, color: colors.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editButton: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  saveBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 24, borderWidth: 1.5,
    borderColor: colors.danger, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
