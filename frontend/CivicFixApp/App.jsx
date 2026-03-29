import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import Login from './components/Login';

export default function App() {
  return (
    <>
      {/* <View style={styles.container}>
        <StatusBar style="auto" />
      </View> */}
      <Login />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
