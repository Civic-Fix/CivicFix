import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './components/Login';
import Signup from './components/Signup';
import Feeds from './components/Feeds';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setScreen('feeds');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
    setUser(null);
    setScreen('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'login' ? (
        <Login
          onSignupPress={() => setScreen('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : screen === 'signup' ? (
        <Signup onLoginPress={() => setScreen('login')} />
      ) : (
        <Feeds user={user} onLogout={handleLogout} />
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
