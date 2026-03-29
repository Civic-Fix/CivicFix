import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your details to continue</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  inputGroup: { marginBottom: 20 },
  input: {
    backgroundColor: '#F5F5F7',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  forgotPass: { alignSelf: 'flex-end' },
  forgotPassText: { color: '#007AFF', fontWeight: '600' },
  loginButton: {
    backgroundColor: '#000',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#999' },
  socialButton: {
    borderWidth: 1,
    borderColor: '#EEE',
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#666', fontSize: 14 },
  signUpText: { color: '#007AFF', fontWeight: '700', fontSize: 14 },
});

export default Login;