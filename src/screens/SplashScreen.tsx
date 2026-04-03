import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar, Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(circleScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Background circles */}
      <Animated.View style={[styles.bgCircle1, { transform: [{ scale: circleScale }] }]} />
      <Animated.View style={[styles.bgCircle2, { transform: [{ scale: circleScale }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, {
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>RVU</Text>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        RVU Connect
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Smart Campus Companion
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute', width: width * 1.2, height: width * 1.2,
    borderRadius: width * 0.6, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.3,
  },
  bgCircle2: {
    position: 'absolute', width: width * 0.8, height: width * 0.8,
    borderRadius: width * 0.4, backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -width * 0.1,
  },
  logoContainer: { marginBottom: 24 },
  logoBox: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  logoLetter: { fontSize: 28, fontWeight: 'bold', color: colors.white },
  appName: {
    fontSize: 32, fontWeight: 'bold', color: colors.white,
    letterSpacing: 1, marginBottom: 10,
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5,
  },
});