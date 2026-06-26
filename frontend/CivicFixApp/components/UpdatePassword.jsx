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
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../config';

const CIVIC_BLUE = '#1D4ED8';
const TEAL = '#14B8A6';

const UpdatePassword = ({ onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/me/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update password.');
      }

      setSuccess('Your password has been updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
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
        <View style={styles.headerBar}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#102A43" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>New password</Text>
            <View style={[styles.inputWrap, focusedField === 'newPassword' && styles.inputFocused]}>
              <MaterialCommunityIcons name="lock-outline" size={19} color={TEAL} />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                underlineColorAndroid="transparent"
                selectionColor={TEAL}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setFocusedField('newPassword')}
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
            <Text style={styles.fieldLabel}>Confirm new password</Text>
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
            onPress={handleUpdatePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flexGrow: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  formCard: { flex: 1, padding: 24 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 6 },
  inputWrap: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#D6DEE8', backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#102A43', fontWeight: '600', outlineWidth: 0 },
  inputFocused: { borderColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  eyeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  alertError: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#FECACA' },
  alertErrorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  alertSuccess: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#99F6E4' },
  alertSuccessText: { color: TEAL, fontSize: 13, flex: 1 },
  primaryBtn: { height: 46, borderRadius: 14, backgroundColor: CIVIC_BLUE, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default UpdatePassword;