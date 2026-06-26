import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../config';

const CIVIC_BLUE = '#1D4ED8';
const TEAL = '#14B8A6';

const ForgotPassword = ({ onBack, initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetRequest = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset instructions.');
      }

      setSuccess('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="email-sync-outline" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Forgot Password</Text>
          <Text style={styles.heroTagline}>Enter your email to get reset instructions</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Reset your password</Text>
          <Text style={styles.formSubheading}>
            We'll send a password reset link to the email address associated with your account.
          </Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
              <MaterialCommunityIcons name="email-outline" size={19} color={TEAL} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                selectionColor={TEAL}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

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
            onPress={handleResetRequest}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Send Instructions</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CIVIC_BLUE },
  scroll: { flexGrow: 1 },
  hero: { alignItems: 'center', paddingTop: 48, paddingBottom: 28, paddingHorizontal: 24, backgroundColor: CIVIC_BLUE },
  logoWrap: { width: 68, height: 68, borderRadius: 20, backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  heroTagline: { fontSize: 13, color: '#DDE7F3', letterSpacing: 0.5, fontWeight: '600' },
  formCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  formHeading: { fontSize: 24, fontWeight: '800', color: '#102A43', marginBottom: 4 },
  formSubheading: { fontSize: 14, color: '#52616B', marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 6 },
  inputWrap: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#D6DEE8', backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#102A43', fontWeight: '600', outlineWidth: 0 },
  inputFocused: { borderColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  alertError: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#FECACA' },
  alertErrorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  alertSuccess: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#99F6E4' },
  alertSuccessText: { color: TEAL, fontSize: 13, flex: 1 },
  primaryBtn: { height: 46, borderRadius: 14, backgroundColor: CIVIC_BLUE, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { marginTop: 16, alignItems: 'center' },
  secondaryBtnText: { color: TEAL, fontSize: 14, fontWeight: '700' },
});

export default ForgotPassword;