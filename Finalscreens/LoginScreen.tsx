import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { detectProgramFromEmail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detected, setDetected] = useState<{ program: string; school: string; color: string } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const detectedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Live email detection as user types
  useEffect(() => {
    if (email.endsWith('@rvu.edu.in')) {
      const result = detectProgramFromEmail(email);
      if (result.isValid) {
        setDetected({
          program: result.profile.programFull,
          school: result.profile.school,
          color: result.profile.color,
        });
        setError('');
        Animated.spring(detectedAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
      } else {
        setDetected(null);
        detectedAnim.setValue(0);
      }
    } else {
      setDetected(null);
      detectedAnim.setValue(0);
    }
  }, [detectedAnim, email]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RVU</Text>
          </View>
          <Text style={styles.appName}>RVU Connect</Text>
          <Text style={styles.tagline}>Smart Campus Portal · All Programs</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSub}>Sign in with your RVU email</Text>

          {/* Email */}
          <Text style={styles.label}>College Email</Text>
          <View style={[styles.inputWrap, detected && { borderColor: detected.color }]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="examplename@rvu.edu.in"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={t => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Live detection pill */}
          {detected && (
            <Animated.View style={[
              styles.detectedPill,
              { backgroundColor: detected.color + '15', borderColor: detected.color + '40' },
              { transform: [{ scale: detectedAnim }] },
            ]}>
              <Text style={[styles.detectedText, { color: detected.color }]}>
                ✓ {detected.program} · {detected.school}
              </Text>
            </Animated.View>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, (!email || !password) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Text>
          </TouchableOpacity>


        </Animated.View>

        <Text style={styles.footer}>RV University · Bengaluru · ©2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.primary, paddingBottom: 32 },

  header: { alignItems: 'center', paddingTop: 82, paddingBottom: 32 },
  logoBox: {
    width: 76, height: 76, borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  card: {
    marginHorizontal: 20, backgroundColor: '#fff',
    borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 22 },

  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 12, backgroundColor: colors.background,
  },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 14, color: colors.text },
  showBtn: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Detection pill
  detectedPill: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 12,
  },
  detectedText: { fontSize: 12, fontWeight: '700' },

  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: 10,
    padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },

  loginBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    height: 52, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    marginBottom: 6,
  },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },


  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 24 },
});
