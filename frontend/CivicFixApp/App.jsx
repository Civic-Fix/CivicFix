import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Login from './components/Login';
import Signup from './components/Signup';
import Feeds from './components/Feeds';
import CreatePost from './components/CreatePost';
import Notifications from './components/Notifications';
import CivicAssistant from './components/CivicAssistant';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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
  const issueUser = issue?.created_by_user;
  const authorName = issueUser?.name || issueUser?.phone || 'CivicFix User';
  // If name still looks like an email (migration not yet run), split at @ for the handle
  const isEmail = authorName.includes('@');
  const displayName = isEmail ? authorName.split('@')[0] : authorName;
  const handle = `@${displayName.replace(/\s+/g, '').toLowerCase()}`;
  const primaryImage = issue?.attachments?.[0]?.file_url || null;
  const isOwner = currentUserId ? issue?.created_by === currentUserId : false;

  return {
    id: issue.id,
    author: displayName,
    handle,
    time: formatRelativeTime(issue.created_at),
    brief: issue.description || issue.title || 'No description provided.',
    location: formatCoordinates(issue.lat, issue.lng),
    status: formatStatus(issue.status),
    image: primaryImage,
    images: (issue.attachments || []).map((attachment) => ({
      uri: attachment.file_url,
      fileName: attachment.file_url?.split('/').pop() || 'issue-proof.jpg',
    })),
    upvotes: issue.upvote_count || 0,
    downvotes: issue.downvote_count || 0,
    lat: issue.lat,
    lng: issue.lng,
    createdBy: issue.created_by,
    currentUserUpvoteId: issue.current_user_upvote_id || null,
    currentUserDownvoteId: issue.current_user_downvote_id || null,
    isOwner,
    verification_status: issue.verification_status || 'pending',
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

      console.log('[App] Loading issues from:', `${API_BASE_URL}/issues`);
      const response = await fetch(`${API_BASE_URL}/issues`, { headers });
      const result = await response.json();

      console.log('[App] Response status:', response.status);
      console.log('[App] Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Unable to fetch issues');
      }

      const mappedIssues = Array.isArray(result.issues)
        ? result.issues.map((issue) => mapIssueToFeedItem(issue, activeUser?.id || null))
        : [];

      console.log('[App] Mapped issues:', mappedIssues);
      setIssues(mappedIssues);
    } catch (error) {
      console.error('[App] loadIssues failed', {
        message: error.message,
        stack: error.stack,
        apiUrl: API_BASE_URL,
      });
    } finally {
      setIsLoadingIssues(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [authToken, userInfo] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('userInfo'),
        ]);
        if (authToken && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setScreen('feeds');
        }
      } catch {
        // ignore parse errors — start at login
      }
    };
    restoreSession();
  }, []);

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

  const handleVote = async (id, voteType) => {
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) return;

    const targetIssue = issues.find((issue) => issue.id === id);
    if (!targetIssue) return;

    const oppositeType = voteType === 'upvote' ? 'downvote' : 'upvote';
    const sameVoteId = voteType === 'upvote' ? targetIssue.currentUserUpvoteId : targetIssue.currentUserDownvoteId;
    const oppositeVoteId = voteType === 'upvote' ? targetIssue.currentUserDownvoteId : targetIssue.currentUserUpvoteId;
    const isRemoving = Boolean(sameVoteId);
    const removingOpposite = Boolean(oppositeVoteId);

    // Optimistic update — handle same-vote toggle and opposite-vote swap
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;
        return {
          ...issue,
          upvotes: issue.upvotes
            + (voteType === 'upvote' ? (isRemoving ? -1 : 1) : 0)
            + (oppositeType === 'upvote' && removingOpposite ? -1 : 0),
          downvotes: issue.downvotes
            + (voteType === 'downvote' ? (isRemoving ? -1 : 1) : 0)
            + (oppositeType === 'downvote' && removingOpposite ? -1 : 0),
          currentUserUpvoteId: voteType === 'upvote'
            ? (isRemoving ? null : 'optimistic')
            : null,
          currentUserDownvoteId: voteType === 'downvote'
            ? (isRemoving ? null : 'optimistic')
            : null,
        };
      })
    );

    try {
      // Remove opposite vote first if it exists
      if (removingOpposite) {
        const res = await fetch(`${API_BASE_URL}/issues/${id}/votes?vote_type=${oppositeType}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) {
          const r = await res.json();
          throw new Error(r.error || 'Unable to remove opposite vote');
        }
      }

      // Toggle the requested vote
      if (isRemoving) {
        const res = await fetch(`${API_BASE_URL}/issues/${id}/votes?vote_type=${voteType}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) {
          const r = await res.json();
          throw new Error(r.error || 'Unable to remove vote');
        }
        const r = await res.json();
        if (r.issue) setIssues((prev) => prev.map((issue) => issue.id === id ? mapIssueToFeedItem(r.issue, user?.id || null) : issue));
      } else {
        const res = await fetch(`${API_BASE_URL}/issues/${id}/votes`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType }),
        });
        const r = await res.json();
        if (!res.ok) throw new Error(r.error || 'Unable to add vote');
        if (r.issue) setIssues((prev) => prev.map((issue) => issue.id === id ? mapIssueToFeedItem(r.issue, user?.id || null) : issue));
      }
    } catch (error) {
      console.warn('[App] handleVote failed', error.message);
      setIssues((prev) => prev.map((issue) => (issue.id === id ? targetIssue : issue)));
    }
  };

  const handleDeletePost = async (id) => {
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) return;

    const targetIssue = issues.find((issue) => issue.id === id);

    // Optimistic update
    setIssues((prev) => prev.filter((issue) => issue.id !== id));

    try {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to delete issue');
    } catch (error) {
      console.warn('[App] handleDeletePost failed', error.message);
      // Revert optimistic update
      if (targetIssue) {
        setIssues((prev) => [targetIssue, ...prev]);
      }
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
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingStateText}>Loading civic reports...</Text>
        </View>
      );
    }

    return (
      <Feeds
        user={user}
        issues={issues}
        isLoading={isLoadingIssues}
        onVote={handleVote}
        onDeletePost={handleDeletePost}
        onLogout={handleLogout}
        onOpenCreatePost={() => setScreen('createPost')}
        onRefresh={loadIssues}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
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
                  color={activeTab === 'home' ? '#16A34A' : '#9CA3AF'}
                />
                <Text style={[styles.bottomLabel, activeTab === 'home' && styles.bottomLabelActive]}>
                  Home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomCenterItem}
                onPress={() => setActiveTab('assistant')}
              >
                <View style={[styles.bottomCenterButton, activeTab === 'assistant' && styles.bottomCenterButtonActive]}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={28}
                    color={activeTab === 'assistant' ? '#FFFFFF' : '#16A34A'}
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
                  color={activeTab === 'notifications' ? '#16A34A' : '#9CA3AF'}
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainContent: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  loadingStateText: {
    marginTop: 14,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    height: 64,
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  bottomCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  bottomCenterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  bottomCenterButtonActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  bottomLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bottomLabelActive: {
    color: '#16A34A',
  },
});
