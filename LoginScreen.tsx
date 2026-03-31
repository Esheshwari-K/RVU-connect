import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  StatusBar, Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleLogin = () => {
    if (!usn || !password) return;
    setLoading(true);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RVU</Text>
          </View>
          <Text style={styles.appName}>RVU Connect</Text>
          <Text style={styles.tagline}>Smart Campus Portal</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSubtitle}>Sign in with your university credentials</Text>

          {/* USN */}
          <Text style={styles.label}>University Serial Number (USN)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🎓</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1RV21CS045"
              placeholderTextColor={colors.textLight}
              value={usn}
              onChangeText={setUsn}
              autoCapitalize="characters"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.loginBtn, (!usn || !password) && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading || !usn || !password}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>Demo: Any USN + password works</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          RV University · Bengaluru{'\n'}
          <Text style={styles.footerSub}>©2025 All rights reserved</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.primary, paddingBottom: 32 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 36 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: colors.accent, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  logoText: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  appName: { fontSize: 26, fontWeight: 'bold', color: colors.white, letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  card: {
    marginHorizontal: 20, backgroundColor: colors.white,
    borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },

  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 16, backgroundColor: colors.background,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: colors.text },
  showBtn: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  forgot: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  loginBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: colors.white, fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },

  demoHint: {
    marginTop: 16, padding: 10, backgroundColor: '#EEF2FF',
    borderRadius: 8, alignItems: 'center',
  },
  demoText: { fontSize: 12, color: colors.primary },

  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 28 },
  footerSub: { color: 'rgba(255,255,255,0.3)' },
});