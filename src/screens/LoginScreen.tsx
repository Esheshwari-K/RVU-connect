// Updated: 2026-04-05
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  StatusBar, Dimensions, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { signInWithEmail, signUpWithEmail } from '../firebase/firebase';

const { width } = Dimensions.get('window');

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('6th Semester');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [hostel, setHostel] = useState('Hostel A');
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');
  const buttonScale = useRef(new Animated.Value(1)).current;

  const rvuEmailRegex = /^[a-zA-Z0-9._%+-]+@rvu\.edu\.in$/;

  const handleLogin = async () => {
    if (!email || !password) return;
    if (!rvuEmailRegex.test(email.toLowerCase().trim())) {
      Alert.alert(
        'Invalid Email',
        'Only RV University emails (@rvu.edu.in) are permitted to sign in.'
      );
      return;
    }

    setLoading(true);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await signInWithEmail(email.trim(), password);
      onLogin();
    } catch (error: any) {
      Alert.alert(
        'Sign in failed',
        error?.message || 'Unable to sign in. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !usn || !branch || !semester || !year || !section || !phone || !dob || !hostel) {
      Alert.alert('Missing details', 'Please fill in all registration fields.');
      return;
    }

    if (!rvuEmailRegex.test(email.toLowerCase().trim())) {
      Alert.alert('Invalid Email', 'Only RV University emails (@rvu.edu.in) are permitted to register.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password must match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }

    setRegisterLoading(true);

    try {
      await signUpWithEmail({
        name,
        usn,
        branch,
        semester,
        year,
        section,
        phone,
        dob,
        hostel,
        email: email.trim(),
        password,
      });
      onLogin();
    } catch (error: any) {
      Alert.alert(
        'Registration failed',
        error?.message || 'Unable to register. Please check your information and try again.'
      );
    } finally {
      setRegisterLoading(false);
    }
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
          <Text style={styles.cardTitle}>
            {view === 'login' ? 'Welcome Back 👋' : 'Create your student account'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {view === 'login'
              ? 'Sign in with your university credentials'
              : 'Register with your RV University email and student details'}
          </Text>

          {view === 'register' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🧑</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Esheshwari Kumari"
                  placeholderTextColor={colors.textLight}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.label}>USN</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🪪</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1RV24CS101"
                  placeholderTextColor={colors.textLight}
                  value={usn}
                  onChangeText={setUsn}
                  autoCapitalize="characters"
                />
              </View>

              <Text style={styles.label}>Branch</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🏫</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Computer Science & Engineering"
                  placeholderTextColor={colors.textLight}
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputColumn, { marginRight: 8 }]}> 
                  <Text style={styles.label}>Semester</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>📘</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="6th Semester"
                      placeholderTextColor={colors.textLight}
                      value={semester}
                      onChangeText={setSemester}
                    />
                  </View>
                </View>
                <View style={styles.inputColumn}>
                  <Text style={styles.label}>Year</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🎓</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="3rd Year"
                      placeholderTextColor={colors.textLight}
                      value={year}
                      onChangeText={setYear}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Section</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔢</Text>
                <TextInput
                  style={styles.input}
                  placeholder="A"
                  placeholderTextColor={colors.textLight}
                  value={section}
                  onChangeText={setSection}
                  autoCapitalize="characters"
                />
              </View>

              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🎂</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20 July 2004"
                  placeholderTextColor={colors.textLight}
                  value={dob}
                  onChangeText={setDob}
                />
              </View>

              <Text style={styles.label}>Hostel / Residence</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🏨</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Girls Hostel A"
                  placeholderTextColor={colors.textLight}
                  value={hostel}
                  onChangeText={setHostel}
                />
              </View>
            </>
          )}

          {/* Email Input */}
          <Text style={styles.label}>University Email ID</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="name@rvu.edu.in"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
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

          {view === 'register' && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPass}
                />
              </View>
            </>
          )}

          {view === 'login' && (
            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Action button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.loginBtn,
                (view === 'login' && (!email || !password)) ||
                (view === 'register' && (!name || !email || !password || !confirmPassword || !usn || !branch || !semester || !year || !section || !phone || !dob || !hostel))
                  ? styles.loginBtnDisabled
                  : undefined,
              ]}
              onPress={view === 'login' ? handleLogin : handleRegister}
              disabled={loading || registerLoading || (view === 'login' ? !email || !password : !name || !email || !password || !confirmPassword || !usn || !branch || !semester || !year || !section || !phone || !dob || !hostel)}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>
                {view === 'login' ? (loading ? 'Verifying...' : 'Sign In') : (registerLoading ? 'Creating account...' : 'Register')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Restriction Notice */}
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>Access restricted to @rvu.edu.in</Text>
          </View>

          <TouchableOpacity onPress={() => setView(view === 'login' ? 'register' : 'login')} style={styles.switchView}>
            <Text style={styles.switchText}>
              {view === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputColumn: { flex: 1 },
  switchView: { marginTop: 18, alignSelf: 'center' },
  switchText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

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
    marginTop: 16, padding: 10, backgroundColor: '#F8FAFC',
    borderRadius: 8, alignItems: 'center',
  },
  demoText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 28 },
  footerSub: { color: 'rgba(255,255,255,0.3)' },
});
