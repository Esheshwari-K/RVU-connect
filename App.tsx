// Updated: 2026-04-05
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';

type AppState = 'splash' | 'login' | 'main';

export default function App() {
  const [state, setState] = useState<AppState>('splash');

  return (
    <SafeAreaProvider>
      {state === 'splash' && <SplashScreen onFinish={() => setState('login')} />}
      {state === 'login' && <LoginScreen onLogin={() => setState('main')} />}
      {state === 'main' && <AppNavigator />}
    </SafeAreaProvider>
  );
}

