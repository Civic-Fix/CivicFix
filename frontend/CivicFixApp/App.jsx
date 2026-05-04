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
import Post from './components/Post';
import CommentForm from './components/CommentForm';

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

  // Ensure timestamp is parsed as UTC if backend omits 'Z'
  const normalizedTimestamp = timestamp.includes('Z') ? timestamp : `${timestamp}Z`;
  const elapsedMs = Date.now() - new Date(normalizedTimestamp).getTime();

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

const formatPostTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  // 1. Ensure the timestamp is parsed as UTC
  const normalizedTimestamp = timestamp.includes('Z') ? timestamp : `${timestamp}Z`;
  const utcDate = new Date(normalizedTimestamp);

  // 2. Explicitly add IST offset (+5 hours 30 minutes = 19,800,000 milliseconds)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffsetMs);

  // 3. Extract time using getUTC* methods (since we manually shifted the time)
  const hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  
  const day = istDate.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[istDate.getUTCMonth()];
  const year = String(istDate.getUTCFullYear()).slice(-2);
  
  return `${displayHours}:${minutes} ${ampm} · ${day} ${month} ${year}`;
};

const formatCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return '';
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const formatLocationDisplay = (locality, lat, lng) => {
  const coordinateText = formatCoordinates(lat, lng);
  const trimmedLocality = typeof locality === 'string' ? locality.trim() : '';

  if (trimmedLocality && coordinateText) {
    return `${trimmedLocality} (${coordinateText})`;
  }

  return trimmedLocality || coordinateText;
};

const mapIssueToFeedItem = (issue, currentUserId = null, anonymousIssueIds = []) => {
  const issueUser = issue?.created_by_user;
  const authorName = issueUser?.name || issueUser?.phone || 'CivicFix User';
  // If name still looks like an email (migration not yet run), split at @ for the handle
  const isEmail = authorName.includes('@');
  const displayName = isEmail ? authorName.split('@')[0] : authorName;
  const isAnonymous = Boolean(issue?.isAnonymous || anonymousIssueIds.includes(issue?.id));
  const author = isAnonymous ? 'Anonymous' : displayName;
  const handle = isAnonymous ? '@anonymous' : `@${displayName.replace(/\s+/g, '').toLowerCase()}`;
  const primaryImage = issue?.attachments?.[0]?.file_url || null;
  const isOwner = currentUserId ? issue?.created_by === currentUserId : false;

  return {
    id: issue.id,
    author,
    handle,
    time: formatRelativeTime(issue.created_at),
    fullTime: formatPostTime(issue.created_at),
    title: issue.title || 'Untitled Issue',
    brief: issue.description || 'No description provided.',
    locality: issue.locality || '',
    location: formatLocationDisplay(issue.locality, issue.lat, issue.lng),
    coordinateLocation: formatCoordinates(issue.lat, issue.lng),
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
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueComments, setSelectedIssueComments] = useState([]);
  const [issues, setIssues] = useState([]);
  const [anonymousIssueIds, setAnonymousIssueIds] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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
        ? result.issues.map((issue) => mapIssueToFeedItem(issue, activeUser?.id || null, anonymousIssueIds))
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
        const [authToken, userInfo, savedAnonymousIds] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('userInfo'),
          AsyncStorage.getItem('anonymousIssueIds'),
        ]);
        if (authToken && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setScreen('feeds');
        }
        if (savedAnonymousIds) {
          setAnonymousIssueIds(JSON.parse(savedAnonymousIds));
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
    if (newPost?.anonymous && newPost?.id) {
      const nextIds = Array.from(new Set([...anonymousIssueIds, newPost.id]));
      setAnonymousIssueIds(nextIds);
      await AsyncStorage.setItem('anonymousIssueIds', JSON.stringify(nextIds));
    }

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

  const mapCommentToViewItem = (comment) => {
    const authorName = comment?.created_by_user?.name || comment?.created_by_user?.email || 'CivicFix User';
    const isEmail = authorName.includes('@');
    const displayName = isEmail ? authorName.split('@')[0] : authorName;
    return {
      id: comment.id,
      description: comment.description,
      vote: comment.vote || 0,
      createdAt: comment.created_at,
      author: displayName,
      handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`,
      createdBy: comment.created_by,
      isOwner: user?.id ? comment.created_by === user.id : false,
    };
  };

  const loadCommentsForIssue = async (issueId) => {
    if (!issueId) return;
    setIsLoadingComments(true);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await fetch(`${API_BASE_URL}/comments?issue_id=${issueId}`, { headers });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to fetch comments');
      }

      const items = Array.isArray(result.comments)
        ? result.comments.map(mapCommentToViewItem).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [];
      setSelectedIssueComments(items);
    } catch (error) {
      console.error('[App] loadCommentsForIssue failed', error.message);
      setSelectedIssueComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleOpenPostDetail = async (issue) => {
    setSelectedIssue(issue);
    setScreen('postDetail');
    await loadCommentsForIssue(issue.id);
  };

  const handleOpenCommentForm = (issue) => {
    setSelectedIssue(issue);
    setScreen('commentForm');
  };

  const handleCreateComment = async (description) => {
    if (!selectedIssue || !description) return;

    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue_id: selectedIssue.id, description }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to create comment');
      }
      await loadCommentsForIssue(selectedIssue.id);
      setScreen('postDetail');
    } catch (error) {
      console.error('[App] handleCreateComment failed', error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to delete comment');
      }
      setSelectedIssueComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('[App] handleDeleteComment failed', error.message);
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    if (!commentId || !['upvote', 'downvote'].includes(voteType)) return;
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to vote on comment');
      }

      setSelectedIssueComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, vote: result.comment?.vote ?? comment.vote }
            : comment
        )
      );
    } catch (error) {
      console.error('[App] handleVoteComment failed', error.message);
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
          <ActivityIndicator size="large" color="#0F766E" />
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
        onOpenPostDetail={handleOpenPostDetail}
        onOpenCommentForm={handleOpenCommentForm}
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
        ) : screen === 'postDetail' ? (
          <Post
            issue={selectedIssue}
            comments={selectedIssueComments}
            isLoadingComments={isLoadingComments}
            onVote={handleVote}
            onDelete={handleDeletePost}
            currentHandle={user ? `@${user.name?.replace(/\s+/g, '').toLowerCase()}` : ''}
            onBack={() => setScreen('feeds')}
            onOpenCommentForm={() => handleOpenCommentForm(selectedIssue)}
            onDeleteComment={handleDeleteComment}
            onVoteComment={handleVoteComment}
          />
        ) : screen === 'commentForm' ? (
          <CommentForm
            issue={selectedIssue}
            onSubmit={handleCreateComment}
            onCancel={() => setScreen('postDetail')}
          />
        ) : (
          <View style={styles.appShell}>
            <View style={styles.mainContent}>{renderMainScreen()}</View>

            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('home')}>
                <View style={[styles.tabIconWrap, activeTab === 'home' && styles.tabIconWrapActive]}>
                  <Feather
                    name="home"
                    size={20}
                    color={activeTab === 'home' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
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
                    size={26}
                    color={activeTab === 'assistant' ? '#FFFFFF' : '#0B2D5C'}
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
                <View style={[styles.tabIconWrap, activeTab === 'notifications' && styles.tabIconWrapActive]}>
                  <Feather
                    name="bell"
                    size={20}
                    color={activeTab === 'notifications' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
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
    backgroundColor: '#F3F4F6',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mainContent: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
  },
  loadingStateText: {
    marginTop: 14,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomBar: {
    height: 68,
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: '#F0FDF4',
  },
  bottomCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    flex: 1,
  },
  bottomCenterButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
    shadowColor: '#0B2D5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomCenterButtonActive: {
    backgroundColor: '#0B2D5C',
    borderColor: '#0B2D5C',
  },
  bottomLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bottomLabelActive: {
    color: '#0B2D5C',
  },
});
