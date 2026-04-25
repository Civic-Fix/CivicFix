import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// const API_BASE_URL = "http://localhost:5000/api"
console.log('[Login] API_BASE_URL', API_BASE_URL); 

const Login = ({ onSignupPress, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      const accessToken = result.session?.accessToken;
      const refreshToken = result.session?.refreshToken;
      const userInfo = result.user ? JSON.stringify(result.user) : null;

      const storageItems = [];
      if (accessToken) {
        storageItems.push(['authToken', accessToken]);
      }
      if (refreshToken) {
        storageItems.push(['refreshToken', refreshToken]);
      }
      if (userInfo) {
        storageItems.push(['userInfo', userInfo]);
      }

      if (storageItems.length) {
        await AsyncStorage.multiSet(storageItems);
        console.log('[Login] auth data saved to AsyncStorage', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          userInfo: !!userInfo,
        });
      } else {
        console.warn('[Login] no auth data found in login response');
      }

      const userData = result.user || (userInfo ? JSON.parse(userInfo) : null);
      setSuccess('Login successful. Welcome to CivicFix!');
      console.log('Auth token:', accessToken);
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>CivicFix Login</Text>
          <Text style={styles.subtitle}>Secure access to your civic workflow</Text>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#EFF6FF" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
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
          <TouchableOpacity onPress={onSignupPress}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#F5F5F5',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 12,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPass: {
    alignSelf: 'flex-end',
  },
  forgotPassText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  successText: {
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999999',
    fontSize: 12,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
  },
  signUpText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 14,
  },
});
export default Login;
