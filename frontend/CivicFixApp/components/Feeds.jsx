import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IssueCard from './IssueCard';

const initialFeed = [
  {
    id: '1',
    author: 'CityWatch',
    handle: '@citywatch',
    time: '2h',
    brief: 'Broken streetlight on Oak Avenue near the park. Please assign a crew for repair.',
    location: 'Oak Avenue Park, Sector 4',
    status: 'Open',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    upvotes: 24,
    downvotes: 3,
  },
  {
    id: '2',
    author: 'Neighbour',
    handle: '@neighborly',
    time: '5h',
    brief: 'Overflowing trash bin at the corner of 3rd and Elm. Health concern for passersby.',
    location: '3rd St & Elm',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    upvotes: 18,
    downvotes: 1,
  },
];

const Feeds = ({ user, onLogout }) => {
  const [issueText, setIssueText] = useState('');
  const [location, setLocation] = useState('');
  const [issues, setIssues] = useState(initialFeed);
  const [infoMessage, setInfoMessage] = useState('');
  const [displayName, setDisplayName] = useState('CivicFix User');

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user]);

  const handleVote = (id, type) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id !== id) return issue;
        return {
          ...issue,
          upvotes: type === 'upvote' ? issue.upvotes + 1 : issue.upvotes,
          downvotes: type === 'downvote' ? issue.downvotes + 1 : issue.downvotes,
        };
      })
    );
  };

  const handlePostIssue = async () => {
    if (!issueText.trim()) {
      setInfoMessage('Please describe the issue before posting.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      author: displayName,
      handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`,
      time: 'Just now',
      brief: issueText.trim(),
      location: location.trim() || 'Location not specified',
      status: 'Reported',
      image:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
      upvotes: 0,
      downvotes: 0,
    };

    setIssues((prev) => [newPost, ...prev]);
    setIssueText('');
    setLocation('');
    setInfoMessage('Issue reported successfully.');

    setTimeout(() => setInfoMessage(''), 3200);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: issueText.trim(),
            location: location.trim(),
            status: 'Reported',
          }),
        });
      }
    } catch (error) {
      console.warn('Issue post failed:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>CivicFix Feed</Text>
          <Text style={styles.pageSubtitle}>Report civic issues quickly with an authentic feed feel.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composerContainer}
      >
        <View style={styles.composerCard}>
          <View style={styles.composerHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.composerTitle}>
              <Text style={styles.composerLabel}>What's the civic issue?</Text>
              <Text style={styles.composerSubLabel}>Post a report for the community and city team.</Text>
            </View>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue you saw..."
            placeholderTextColor="#94A3B8"
            multiline
            value={issueText}
            onChangeText={setIssueText}
          />
          <TextInput
            style={styles.input}
            placeholder="Location (optional)"
            placeholderTextColor="#94A3B8"
            value={location}
            onChangeText={setLocation}
          />

          {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

          <TouchableOpacity style={styles.postButton} onPress={handlePostIssue}>
            <Text style={styles.postButtonText}>Post Issue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ScrollView contentContainerStyle={styles.feedList} showsVerticalScrollIndicator={false}>
        {issues.map((item) => (
          <IssueCard key={item.id} issue={item} onVote={handleVote} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  logoutText: {
    color: '#EFF6FF',
    fontWeight: '700',
  },
  composerContainer: {
    marginBottom: 14,
  },
  composerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#EFF6FF',
    fontWeight: '800',
    fontSize: 18,
  },
  composerTitle: {
    flex: 1,
  },
  composerLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  composerSubLabel: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },
  textArea: {
    backgroundColor: '#020617',
    color: '#F8FAFC',
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#020617',
    color: '#F8FAFC',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  infoText: {
    color: '#86EFAC',
    marginBottom: 12,
    fontSize: 14,
  },
  postButton: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#EFF6FF',
    fontWeight: '700',
    fontSize: 16,
  },
  feedList: {
    paddingBottom: 32,
  },
  feedCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  feedHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitialSmall: {
    color: '#EFF6FF',
    fontWeight: '800',
  },
  feedHeaderText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginRight: 8,
  },
  authorHandle: {
    color: '#94A3B8',
    marginRight: 8,
  },
  timeStamp: {
    color: '#94A3B8',
  },
  locationLabel: {
    color: '#CBD5E1',
    marginTop: 2,
  },
  feedContent: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusChip: {
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 8,
  },
  statusText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 12,
  },
  cardAction: {
    color: '#94A3B8',
    marginRight: 18,
    fontSize: 13,
    marginBottom: 8,
  },
});

export default Feeds;
