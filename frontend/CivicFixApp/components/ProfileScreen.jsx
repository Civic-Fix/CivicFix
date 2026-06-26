import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config';

const CIVIC_BLUE = '#1D4ED8';
const TEAL = '#14B8A6';

const ProfileScreen = ({ user, issues, onLogout, onUserUpdated, onOpenUpdatePassword }) => {
  const [name, setName] = useState(user?.profile?.name || user?.name || '');
  const [avatar, setAvatar] = useState(user?.profile?.avatar_url || user?.avatarUrl || null);
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user?.profile?.name || user?.name || '');
    setAvatar(user?.profile?.avatar_url || user?.avatarUrl || null);
    setNewAvatar(null);
  }, [user]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const pickedImage = result.assets[0];
      setNewAvatar({
        uri: pickedImage.uri,
        base64: pickedImage.base64,
        mimeType: pickedImage.mimeType || 'image/jpeg',
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrlToSave = avatar;
      const authToken = await AsyncStorage.getItem('authToken');

      if (newAvatar) {
        // Upload the new avatar via the backend API
        const uploadResponse = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            file_name: `${user.id}.${newAvatar.mimeType.split('/')[1] || 'jpg'}`,
            mime_type: newAvatar.mimeType,
            file_data_base64: newAvatar.base64,
          }),
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || 'Failed to upload new avatar.');
        }

        avatarUrlToSave = uploadResult.avatarUrl; // Assumes backend returns { avatarUrl: '...' }
      }

      // Now, update the user metadata with the new name and the storage URL
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, avatarUrl: avatarUrlToSave }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile.');
      }

      const updatedUser = { ...user, profile: result.profile };
      onUserUpdated(updatedUser);
      setAvatar(avatarUrlToSave);
      setNewAvatar(null);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const authToken = await AsyncStorage.getItem('authToken');
              const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` },
              });

              if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete account.');
              }
              onLogout();
            } catch (err) {
              setError(err.message);
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const userIssuesCount = issues.filter(issue => issue.createdBy === user.id).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
          {newAvatar?.uri || (avatar && !avatar.startsWith('data:')) ? (
            <Image source={{ uri: newAvatar?.uri || avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera" size={32} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <MaterialCommunityIcons name="camera-plus" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setIsEditing(true);
          }}
          placeholder="Your Name"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userIssuesCount}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.profile?.trust_score || 0}</Text>
          <Text style={styles.statLabel}>Trust Score</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      {isEditing && (
        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionItem} onPress={onOpenUpdatePassword}>
          <MaterialCommunityIcons name="lock-reset" size={22} color={TEAL} />
          <Text style={styles.actionText}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={onLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#6B7280" />
          <Text style={styles.actionText}>Sign Out</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.deleteAction]} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="delete-forever-outline" size={22} color="#EF4444" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete Account</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: TEAL,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D1D5DB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: CIVIC_BLUE,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    width: '80%',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CIVIC_BLUE,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: TEAL,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionsSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#374151',
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    color: TEAL,
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default ProfileScreen;