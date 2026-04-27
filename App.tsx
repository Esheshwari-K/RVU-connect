// Updated: 2026-04-05
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { firebaseAuth } from './src/firebase/firebase';

type AppState = 'splash' | 'login' | 'main';

export default function App() {
  const [state, setState] = useState<AppState>('splash');

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      setState(user ? 'main' : 'login');
    });
    return unsubscribe;
  }, []);

  const handleSplashFinish = () => {
    setState(prev => (prev === 'splash' ? 'login' : prev));
  };

  return (
    <SafeAreaProvider>
      {state === 'splash' && <SplashScreen onFinish={handleSplashFinish} />}
      {state === 'login' && <LoginScreen onLogin={() => setState('main')} />}
      {state === 'main' && <AppNavigator />}
    </SafeAreaProvider>
  );
}

