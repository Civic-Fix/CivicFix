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
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL = 'http://localhost:5000/api';
console.log('[Signup] API_BASE_URL', API_BASE_URL);

const CIVIC_BLUE = '#1D4ED8';
const TEAL = '#14B8A6';

const Signup = ({ onLoginPress }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSignup = async () => {
    setError('');
    setSuccess('');

    if (!email || !password || !name) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, accountType: 'citizen' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      setSuccess('Account created! Please check your email to verify your account.');
    } catch (err) {
      setError(err.message || 'Unable to sign up.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Jane Smith', value: name, onChange: setName, autoCapitalize: 'words', keyboardType: 'default' },
    { key: 'email', label: 'Email', placeholder: 'you@example.com', value: email, onChange: setEmail, autoCapitalize: 'none', keyboardType: 'email-address' },
    { key: 'phone', label: 'Phone (optional)', placeholder: '+1 234 567 8900', value: phone, onChange: setPhone, autoCapitalize: 'none', keyboardType: 'phone-pad' },
    { key: 'password', label: 'Password', placeholder: '••••••••', value: password, onChange: setPassword, autoCapitalize: 'none', keyboardType: 'default', secureTextEntry: true },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="city-variant-outline" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>CivicFix</Text>
          <Text style={styles.heroTagline}>Join your community today</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Create account</Text>
          <Text style={styles.formSubheading}>Start reporting civic issues near you</Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={[styles.inputWrap, focusedField === field.key && styles.inputFocused]}>
                <MaterialCommunityIcons
                  name={{
                    name: 'account-outline',
                    email: 'email-outline',
                    phone: 'phone-outline',
                    password: 'lock-outline',
                  }[field.key]}
                  size={19}
                  color={TEAL}
                />
                <TextInput
                  style={styles.input}
                  placeholder={field.key === 'password' ? 'Password' : field.placeholder}
                  placeholderTextColor="#64748B"
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.autoCapitalize}
                  underlineColorAndroid="transparent"
                  selectionColor={TEAL}
                  secureTextEntry={field.secureTextEntry && !showPassword}
                  value={field.value}
                  onChangeText={field.onChange}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                />
                {field.key === 'password' ? (
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#475569"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}

          {error ? (
            <View style={styles.alertError}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#DC2626" />
              <Text style={styles.alertErrorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={styles.alertSuccess}>
              <MaterialCommunityIcons name="check-circle-outline" size={15} color={TEAL} />
              <Text style={styles.alertSuccessText}>{success}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="account-plus-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onLoginPress}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CIVIC_BLUE,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 42,
    paddingBottom: 26,
    paddingHorizontal: 24,
    backgroundColor: CIVIC_BLUE,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 13,
    color: '#DDE7F3',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  formSubheading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D6DEE8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#102A43',
    fontWeight: '600',
    outlineWidth: 0,
    outlineStyle: 'none',
    outlineColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertErrorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  alertSuccessText: {
    color: TEAL,
    fontSize: 13,
    flex: 1,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: CIVIC_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    shadowColor: CIVIC_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#52616B',
    fontSize: 14,
  },
  footerLink: {
    color: TEAL,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Signup;
