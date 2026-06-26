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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // Import the Supabase client
import { supabase } from '../supabaseClient';

const CIVIC_BLUE = '#1D4ED8';
const TEAL = '#14B8A6';

const ResetPassword = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Use the Supabase client to update the user's password
      // Supabase automatically handles the recovery token from the URL
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Your password has been updated. You can now sign in.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onBack(); // Navigate back to login after a short delay
      }, 2000);
    } catch (err) {
      setError(err.message || 'Unable to update password.');
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
            <MaterialCommunityIcons name="lock-reset" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Reset password</Text>
          <Text style={styles.heroTagline}>Choose a new password for your account</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Set new password</Text>
          <Text style={styles.formSubheading}>Use the reset link you opened to create a new password.</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>New password</Text>
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
              <MaterialCommunityIcons name="lock-outline" size={19} color={TEAL} />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                underlineColorAndroid="transparent"
                selectionColor={TEAL}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
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
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Confirm password</Text>
            <View style={[styles.inputWrap, focusedField === 'confirmPassword' && styles.inputFocused]}>
              <MaterialCommunityIcons name="lock-check-outline" size={19} color={TEAL} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                underlineColorAndroid="transparent"
                selectionColor={TEAL}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
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
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Update password</Text>
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
  container: {
    flex: 1,
    backgroundColor: CIVIC_BLUE,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 28,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 13,
    color: '#DDE7F3',
    letterSpacing: 0.5,
    fontWeight: '600',
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
    color: '#102A43',
    marginBottom: 4,
  },
  formSubheading: {
    fontSize: 14,
    color: '#52616B',
    marginBottom: 24,
  },
  fieldWrap: {
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#D6DEE8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
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
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#99F6E4',
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
  },
  secondaryBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ResetPassword;
