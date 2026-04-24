import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Login from './components/Login';
import Signup from './components/Signup';
import Feeds from './components/Feeds';
import CreatePost from './components/CreatePost';
import Notifications from './components/Notifications';
import CivicAssistant from './components/CivicAssistant';

const API_BASE_URL = 'http://localhost:5000/api';

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Reported';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) {
    return 'Just now';
  }

  const elapsedMs = Date.now() - new Date(timestamp).getTime();

  if (Number.isNaN(elapsedMs) || elapsedMs < 60000) {
    return 'Just now';
  }

  const minutes = Math.floor(elapsedMs / 60000);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
};

const formatCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return '';
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const mapIssueToFeedItem = (issue, currentUserId = null) => {
  const authorName =
    issue?.created_by_user?.name ||
    issue?.created_by_user?.phone ||
    'CivicFix User';
  const handleBase = authorName.replace(/\s+/g, '').toLowerCase() || 'civicfixuser';
  const primaryImage = issue?.attachments?.[0]?.file_url || null;
  const isOwner = currentUserId ? issue?.created_by === currentUserId : false;

  return {
    id: issue.id,
    author: authorName,
    handle: `@${handleBase}`,
    time: formatRelativeTime(issue.created_at),
    brief: issue.description || issue.title || 'No description provided.',
    location: formatCoordinates(issue.lat, issue.lng),
    status: formatStatus(issue.status),
    image: primaryImage,
    images: (issue.attachments || []).map((attachment) => ({
      uri: attachment.file_url,
      fileName: attachment.file_url?.split('/').pop() || 'issue-proof.jpg',
    })),
    upvotes: issue.vote_count || 0,
    downvotes: 0,
    lat: issue.lat,
    lng: issue.lng,
    createdBy: issue.created_by,
    hasVoted: Boolean(issue.current_user_has_voted),
    currentUserVoteId: issue.current_user_vote_id || null,
    isOwner,
  };
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  const loadIssues = async (activeUser = user) => {
    setIsLoadingIssues(true);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      const response = await fetch(`${API_BASE_URL}/issues`, { headers });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to fetch issues');
      }

      const mappedIssues = Array.isArray(result.issues)
        ? result.issues.map((issue) => mapIssueToFeedItem(issue, activeUser?.id || null))
        : [];

      setIssues(mappedIssues);
    } catch (error) {
      console.warn('[App] loadIssues failed', error.message);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (screen === 'feeds' && activeTab === 'home') {
      loadIssues();
    }
  }, [screen, user, activeTab]);

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setScreen('feeds');
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
    setUser(null);
    setIssues([]);
    setScreen('login');
  };

  const handleCreatePost = async (newPost) => {
    setIssues((prev) => [newPost, ...prev]);
    setScreen('feeds');
    setActiveTab('home');
    await loadIssues(user);
  };

  const handleVote = async (id, type) => {
    const authToken = await AsyncStorage.getItem('authToken');

    if (!authToken) {
      return;
    }

    const targetIssue = issues.find((issue) => issue.id === id);

    if (!targetIssue) {
      return;
    }

    const shouldRemoveVote =
      (type === 'upvote' && targetIssue.hasVoted) ||
      (type === 'downvote' && targetIssue.hasVoted);

    if (type === 'downvote' && !targetIssue.hasVoted) {
      return;
    }

    const method = shouldRemoveVote ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`${API_BASE_URL}/issues/${id}/votes`, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update vote');
      }

      const updatedIssue = result.issue;

      if (!updatedIssue) {
        throw new Error('Vote updated but no issue payload returned');
      }

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === id ? mapIssueToFeedItem(updatedIssue, user?.id || null) : issue
        )
      );
    } catch (error) {
      console.warn('[App] handleVote failed', error.message);
      // Show user-friendly error messages
      if (error.message.includes('cannot act on their own')) {
        alert('You cannot vote on your own posts');
      } else if (error.message) {
        alert(`Vote failed: ${error.message}`);
      }
    }
  };

  const handleDeletePost = async (id) => {
    const authToken = await AsyncStorage.getItem('authToken');

    if (!authToken) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to delete issue');
      }

      setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== id));
    } catch (error) {
      console.warn('[App] handleDeletePost failed', error.message);
    }
  };

  const renderMainScreen = () => {
    if (activeTab === 'notifications') {
      return <Notifications issues={issues} />;
    }

    if (activeTab === 'assistant') {
      return <CivicAssistant user={user} />;
    }

    if (isLoadingIssues) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingStateText}>Loading civic reports...</Text>
        </View>
      );
    }

    return (
      <Feeds
        user={user}
        issues={issues}
        onVote={handleVote}
        onDeletePost={handleDeletePost}
        onLogout={handleLogout}
        onOpenCreatePost={() => setScreen('createPost')}
      />
    );
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
      ) : screen === 'createPost' ? (
        <CreatePost
          user={user}
          onPostCreated={handleCreatePost}
          onCancel={() => setScreen('feeds')}
        />
      ) : (
        <View style={styles.appShell}>
          <View style={styles.mainContent}>{renderMainScreen()}</View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('home')}>
              <Feather
                name="home"
                size={22}
                color={activeTab === 'home' ? '#FFFFFF' : '#6B7280'}
              />
              <Text style={[styles.bottomLabel, activeTab === 'home' && styles.bottomLabelActive]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomCenterItem}
              onPress={() => setActiveTab('assistant')}
            >
              <View style={styles.bottomCenterButton}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={28}
                  color={activeTab === 'assistant' ? '#000000' : '#111111'}
                />
              </View>
              <Text
                style={[
                  styles.bottomLabel,
                  activeTab === 'assistant' && styles.bottomLabelActive,
                ]}
              >
                CivicBot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => setActiveTab('notifications')}
            >
              <Feather
                name="bell"
                size={22}
                color={activeTab === 'notifications' ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.bottomLabel,
                  activeTab === 'notifications' && styles.bottomLabelActive,
                ]}
              >
                Alerts
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContent: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  loadingStateText: {
    marginTop: 14,
    color: '#D4D4D8',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    height: 68,
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#18181B',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  bottomCenterItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -16,
  },
  bottomCenterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
  },
  bottomLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomLabelActive: {
    color: '#FFFFFF',
  },
});
