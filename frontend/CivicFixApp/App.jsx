import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Login from './components/Login';
import Signup from './components/Signup';

export default function App() {
  const [screen, setScreen] = useState('login');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'login' ? (
        <Login onSignupPress={() => setScreen('signup')} />
      ) : (
        <Signup onLoginPress={() => setScreen('login')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
