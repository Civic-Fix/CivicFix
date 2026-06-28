import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import Feeds from './components/Feeds';
import SearchScreen from './components/SearchScreen';
import CreatePost from './components/CreatePost';
import Notifications from './components/Notifications';
import ProfileScreen from './components/ProfileScreen';
import CivicAssistant from './components/CivicAssistant';
import IssueMap from './components/IssueMap';
import Post from './components/Post';
import CommentForm from './components/CommentForm';
import { API_BASE_URL, ISSUE_SHARE_BASE_URL } from './config';
import { listAllUpdates, listIssueUpdates } from './services/updatesService';
import { authenticatedFetch, clearStoredSession, getAuthToken } from './utils/authSession';


const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Reported';

const formatCategoryLabel = (category) =>
  category
    ? category
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

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

const buildIssueShareUrl = (issueId) =>
  `${ISSUE_SHARE_BASE_URL}/share/issues/${encodeURIComponent(issueId)}`;

const mapIssueToFeedItem = (issue, currentUserId = null, anonymousIssueIds = []) => {
  const issueUser = issue?.created_by_user;
  const authorName = issueUser?.name || issueUser?.phone || 'CivicFix User';
  // If name still looks like an email (migration not yet run), split at @ for the handle
  const isEmail = authorName.includes('@');
  const displayName = isEmail ? authorName.split('@')[0] : authorName;
  const isAnonymous = Boolean(
    issue?.is_anonymous ||
      issue?.isAnonymous ||
      issue?.anonymous ||
      anonymousIssueIds.includes(issue?.id)
  );
  const author = isAnonymous ? 'Anonymous' : displayName;
  const handle = isAnonymous ? '@anonymous' : `@${displayName.replace(/\s+/g, '').toLowerCase()}`;
  const primaryImage = issue?.attachments?.[0]?.file_url || null;
  const isOwner = Boolean(issue?.is_owner || (currentUserId && issue?.created_by === currentUserId));

  return {
    id: issue.id,
    author,
    avatar_url: issueUser?.avatar_url,
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
    isAnonymous,
    currentUserUpvoteId: issue.current_user_upvote_id || null,
    currentUserDownvoteId: issue.current_user_downvote_id || null,
    isOwner,
    verification_status: issue.verification_status || 'pending',
    aiCategory: issue.category || issue.ai_analysis?.classification?.category || '',
    aiCategoryConfidence: issue.ai_category_confidence ?? issue.ai_analysis?.classification?.confidence ?? null,
    aiCategoryLabel: formatCategoryLabel(issue.category || issue.ai_analysis?.classification?.category),
    aiSeverity: issue.ai_severity || issue.ai_analysis?.classification?.severity || '',
    aiSummary: issue.ai_summary || issue.ai_analysis?.classification?.summary || '',
    aiTags: issue.ai_tags || issue.ai_analysis?.classification?.tags || [],
    aiDuplicateOf: issue.ai_duplicate_of || issue.ai_analysis?.duplicate_detection?.duplicate_of || null,
    aiDuplicateScore: issue.ai_duplicate_score ?? issue.ai_analysis?.duplicate_detection?.duplicate_score ?? null,
    aiDuplicateCandidates:
      issue.ai_duplicate_candidates || issue.ai_analysis?.duplicate_detection?.candidates || [],
    aiAnalyzedAt: issue.ai_analyzed_at || issue.ai_analysis?.analyzed_at || null,
    aiPending: !issue.ai_analyzed_at && !issue.ai_analysis?.analyzed_at,
  };
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [isResetPasswordFlow, setIsResetPasswordFlow] = useState(false);
  const [isUpdatePasswordFlow, setIsUpdatePasswordFlow] = useState(false);
  const [user, setUser] = useState(null);
  const [initialForgotPasswordEmail, setInitialForgotPasswordEmail] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueComments, setSelectedIssueComments] = useState([]);
  const [selectedIssueUpdates, setSelectedIssueUpdates] = useState([]);
  const [isLoadingIssueUpdates, setIsLoadingIssueUpdates] = useState(false);
  const [issues, setIssues] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [anonymousIssueIds, setAnonymousIssueIds] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavigatingIssue, setIsNavigatingIssue] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const aiAnalysisQueuedRef = useRef(new Set());
  const aiPollAttemptsRef = useRef(new Map());
  const hasLoadedIssuesRef = useRef(false);
  const hasLoadedUpdatesRef = useRef(false);

  const loadIssues = useCallback(async (activeUser = user) => {
    setIsLoadingIssues(true);

    try {
      console.log('[App] Loading issues from:', `${API_BASE_URL}/issues`);
      const response = await authenticatedFetch(`${API_BASE_URL}/issues`);
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
  }, [user, anonymousIssueIds]);

  const loadSearchResults = async (query) => {
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/issues/search?q=${encodeURIComponent(trimmedQuery)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to search issues');
      }

      const mappedIssues = Array.isArray(result.issues)
        ? result.issues.map((issue) => mapIssueToFeedItem(issue, user?.id || null, anonymousIssueIds))
        : [];

      setSearchResults(mappedIssues);
    } catch (error) {
      console.error('[App] loadSearchResults failed', {
        message: error.message,
        query: trimmedQuery,
      });
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        loadSearchResults(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user, anonymousIssueIds]);

  useEffect(() => {
    // This function handles the incoming URL and checks for a recovery token
    const handleRecoveryUrl = (url) => {
      if (!url) return;

      // Supabase appends the recovery info in a URL fragment
      const params = new URLSearchParams(url.split('#')[1]);
      if (params.get('type') === 'recovery') {
        setIsResetPasswordFlow(true);
        setScreen('resetPassword');
      }
    };

    // Check for an initial URL when the app is opened from a cold start
    Linking.getInitialURL().then(url => handleRecoveryUrl(url));

    // Listen for incoming links while the app is running
    const subscription = Linking.addEventListener('url', ({ url }) => handleRecoveryUrl(url));

    return () => subscription.remove();
  }, []);

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

  const handleLoginSuccess = async (userData) => {
    const userToStore = {
      ...userData,
      // Exclude large fields from the stored user object to keep the token small
      profile: userData.profile ? {
        name: userData.profile.name,
        avatar_url: userData.profile.avatar_url,
        trust_score: userData.profile.trust_score,
      } : null,
    };

    hasLoadedIssuesRef.current = false;
    hasLoadedUpdatesRef.current = false;
    setUser(userToStore);
    setScreen('feeds');
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await clearStoredSession();
    await AsyncStorage.removeItem('anonymousIssueIds');
    hasLoadedIssuesRef.current = false;
    hasLoadedUpdatesRef.current = false;
    setUser(null);
    setIssues([]);
    setUpdates([]);
    setSearchQuery('');
    setIsUpdatePasswordFlow(false);
    setSearchResults([]);
    setScreen('login');
  };

  const handleUserUpdated = async (nextUser) => {
    const userToStore = {
      ...nextUser,
      profile: nextUser.profile ? {
        name: nextUser.profile.name,
        avatar_url: nextUser.profile.avatar_url,
        trust_score: nextUser.profile.trust_score,
      } : null,
    };

    setUser(userToStore);
    await AsyncStorage.setItem('userInfo', JSON.stringify(userToStore));
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
    loadIssues(user);
  };

  const loadUpdates = useCallback(async () => {
    setIsLoadingUpdates(true);

    try {
      const result = await listAllUpdates();
      const mappedUpdates = Array.isArray(result)
        ? result.map((update) => {
            const organizationName =
              update.issue?.organization?.name ||
              update.organization?.name ||
              update.organization_name ||
              null;

            return {
              ...update,
              issueTitle: update.issue_title || update.issue?.title || `Issue ${update.issue_id}`,
              issueLocality: update.issue?.locality || '',
              issueStatus: update.issue?.status || '',
              time: formatRelativeTime(update.created_at),
              content: update.content || update.message,
              organizationName,
            };
          })
        : [];

      setUpdates(mappedUpdates);
    } catch (error) {
      console.error('[App] loadUpdates failed', error.message || error);
      setUpdates([]);
    } finally {
      setIsLoadingUpdates(false);
    }
  }, []);

  useEffect(() => {
    if (screen !== 'feeds') {
      return;
    }

    if (!hasLoadedIssuesRef.current) {
      hasLoadedIssuesRef.current = true;
      loadIssues();
    }

    if (!hasLoadedUpdatesRef.current) {
      hasLoadedUpdatesRef.current = true;
      loadUpdates();
    }
  }, [screen, user, loadIssues, loadUpdates]);

  useEffect(() => {
    if (screen === 'feeds' && activeTab === 'notifications') {
      loadUpdates();
    }
  }, [screen, activeTab, loadUpdates]);

  const updateIssueEverywhere = (id, updater) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? updater(issue) : issue))
    );
    setSelectedIssue((prev) => (prev?.id === id ? updater(prev) : prev));
  };

  const handleVote = async (id, voteType) => {
    const authToken = await getAuthToken();
    if (!authToken) return;

    const targetIssue = issues.find((issue) => issue.id === id) || (selectedIssue?.id === id ? selectedIssue : null);
    if (!targetIssue) return;

    const oppositeType = voteType === 'upvote' ? 'downvote' : 'upvote';
    const sameVoteId = voteType === 'upvote' ? targetIssue.currentUserUpvoteId : targetIssue.currentUserDownvoteId;
    const oppositeVoteId = voteType === 'upvote' ? targetIssue.currentUserDownvoteId : targetIssue.currentUserUpvoteId;
    const isRemoving = Boolean(sameVoteId);
    const removingOpposite = Boolean(oppositeVoteId);

    const applyOptimisticVote = (issue) => ({
      ...issue,
      upvotes: Math.max(
        0,
        issue.upvotes
          + (voteType === 'upvote' ? (isRemoving ? -1 : 1) : 0)
          + (oppositeType === 'upvote' && removingOpposite ? -1 : 0)
      ),
      downvotes: Math.max(
        0,
        issue.downvotes
          + (voteType === 'downvote' ? (isRemoving ? -1 : 1) : 0)
          + (oppositeType === 'downvote' && removingOpposite ? -1 : 0)
      ),
      currentUserUpvoteId: voteType === 'upvote'
        ? (isRemoving ? null : 'optimistic')
        : null,
      currentUserDownvoteId: voteType === 'downvote'
        ? (isRemoving ? null : 'optimistic')
        : null,
    });

    // Optimistic update — handle same-vote toggle and opposite-vote swap.
    updateIssueEverywhere(id, applyOptimisticVote);

    try {
      // Remove opposite vote first if it exists
      if (removingOpposite) {
        const res = await authenticatedFetch(`${API_BASE_URL}/issues/${id}/votes?vote_type=${oppositeType}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const r = await res.json();
          throw new Error(r.error || 'Unable to remove opposite vote');
        }
      }

      // Toggle the requested vote
      if (isRemoving) {
        const res = await authenticatedFetch(`${API_BASE_URL}/issues/${id}/votes?vote_type=${voteType}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const r = await res.json();
          throw new Error(r.error || 'Unable to remove vote');
        }
        const r = await res.json();
        if (r.issue) {
          const updatedIssue = mapIssueToFeedItem(r.issue, user?.id || null, anonymousIssueIds);
          updateIssueEverywhere(id, () => updatedIssue);
        }
      } else {
        const res = await authenticatedFetch(`${API_BASE_URL}/issues/${id}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType }),
        });
        const r = await res.json();
        if (!res.ok) throw new Error(r.error || 'Unable to add vote');
        if (r.issue) {
          const updatedIssue = mapIssueToFeedItem(r.issue, user?.id || null, anonymousIssueIds);
          updateIssueEverywhere(id, () => updatedIssue);
        }
      }
    } catch (error) {
      console.warn('[App] handleVote failed', error.message);
      updateIssueEverywhere(id, () => targetIssue);
    }
  };

  const handleDeletePost = async (id) => {
    const authToken = await getAuthToken();
    if (!authToken) return;

    const targetIssue = issues.find((issue) => issue.id === id);

    // Optimistic update
    setIssues((prev) => prev.filter((issue) => issue.id !== id));

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'DELETE',
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

  const handleShareIssue = async (issue) => {
    if (!issue?.id) return;

    const shareUrl = buildIssueShareUrl(issue.id);
    const title = issue.title || `CivicFix issue #${issue.id}`;
    const location = issue.locality || issue.location;
    const message = [
      title,
      location ? `Location: ${location}` : '',
      issue.brief ? `Details: ${issue.brief}` : '',
      `View live issue: ${shareUrl}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await Share.share({
        title,
        message,
        url: shareUrl,
      });
    } catch (error) {
      console.warn('[App] share failed', error.message);
      Alert.alert('Unable to share', 'Please try sharing this issue again.');
    }
  };

  const mapCommentToViewItem = (comment) => {
    const authorName = comment?.created_by_user?.name || comment?.created_by_user?.email || 'CivicFix User';
    const isEmail = authorName.includes('@');
    const displayName = isEmail ? authorName.split('@')[0] : authorName;
    
    // Get organization name and verification status
    const organizationName = comment?.organization?.name || null;
    const organizationId = comment?.organization?.id || comment?.assigned_organization_id || null;
    const isAuthorityVerified = Boolean(comment?.organization?.is_verified || comment?.is_authority_verified);
    
    return {
      id: comment.id,
      description: comment.description,
      vote: comment.vote || 0,
      createdAt: comment.created_at,
      author: displayName,
      handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`,
      createdBy: comment.created_by,
      isOwner: user?.id ? comment.created_by === user.id : false,
      organizationName,
      organizationId,
      isAuthorityVerified,
    };
  };

  const loadCommentsForIssue = async (issueId) => {
    if (!issueId) return;
    setIsLoadingComments(true);

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments?issue_id=${issueId}`);
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

  const loadIssueUpdates = async (issueId) => {
    if (!issueId) {
      setSelectedIssueUpdates([]);
      return;
    }

    setIsLoadingIssueUpdates(true);

    try {
      const result = await listIssueUpdates(issueId);
      const items = Array.isArray(result)
        ? result.map((update) => {
            const organizationName =
              update?.issue?.organization?.name ||
              update?.organization?.name ||
              update?.organization_name ||
              'Assigned organization';
            
            return {
              ...update,
              time: formatRelativeTime(update.created_at),
              content: update.content || update.message,
              organizationName,
              authorId: update.created_by,
            };
          })
        : [];
      setSelectedIssueUpdates(items);
    } catch (error) {
      console.error('[App] loadIssueUpdates failed', issueId, error.message || error);
      setSelectedIssueUpdates([]);
    } finally {
      setIsLoadingIssueUpdates(false);
    }
  };

  const loadIssueById = async (issueId) => {
    if (!issueId) return null;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/issues/${issueId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to fetch issue');
      }

      return mapIssueToFeedItem(result.issue, user?.id || null, anonymousIssueIds);
    } catch (error) {
      console.error('[App] loadIssueById failed', issueId, error.message || error);
      return null;
    }
  };

  useEffect(() => {
    const pendingIssueIds = issues
      .filter((issue) => issue.aiPending && issue.id)
      .map((issue) => issue.id);

    if (!pendingIssueIds.length) {
      return undefined;
    }

    let isActive = true;

    const queueAnalysisForPendingIssues = async () => {
      const authToken = await getAuthToken();
      if (!authToken) return;

      pendingIssueIds.forEach((issueId) => {
        if (aiAnalysisQueuedRef.current.has(issueId)) {
          return;
        }

        aiAnalysisQueuedRef.current.add(issueId);

        authenticatedFetch(`${API_BASE_URL}/ai/issues/${issueId}/analyze?async=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ async: true }),
        }).catch((error) => {
          aiAnalysisQueuedRef.current.delete(issueId);
          console.warn('[App] queue AI analysis failed', issueId, error.message);
        });
      });
    };

    const refreshPendingIssues = async () => {
      if (!isActive) return;

      await Promise.all(
        pendingIssueIds.map(async (issueId) => {
          const attempts = aiPollAttemptsRef.current.get(issueId) || 0;
          if (attempts >= 20) return;

          aiPollAttemptsRef.current.set(issueId, attempts + 1);
          const updatedIssue = await loadIssueById(issueId);

          if (!isActive || !updatedIssue) return;

          if (!updatedIssue.aiPending) {
            aiPollAttemptsRef.current.delete(issueId);
            aiAnalysisQueuedRef.current.delete(issueId);
            updateIssueEverywhere(issueId, () => updatedIssue);
          }
        })
      );
    };

    queueAnalysisForPendingIssues();
    const pollTimer = setInterval(refreshPendingIssues, 3000);
    refreshPendingIssues();

    return () => {
      isActive = false;
      clearInterval(pollTimer);
    };
  }, [issues, user, anonymousIssueIds]);

  const handleOpenIssueFromUpdate = async (update) => {
    const issueId = update?.issue?.id || update?.issue_id;
    if (!issueId) return;

    const issue = await loadIssueById(issueId);
    if (!issue) return;

    await handleOpenPostDetail(issue);
  };

  const handleOpenPostDetail = async (issue) => {
    if (!issue) return;

    setIsNavigatingIssue(true);
    setSelectedIssue(issue);
    setScreen('postDetail');

    try {
      await Promise.all([loadCommentsForIssue(issue.id), loadIssueUpdates(issue.id)]);
    } finally {
      setIsNavigatingIssue(false);
    }
  };

  const handleOpenCommentForm = (issue) => {
    setSelectedIssue(issue);
    setScreen('commentForm');
  };

  const handleCreateComment = async (description) => {
    if (!selectedIssue || !description) return;

    const authToken = await getAuthToken();
    if (!authToken) return;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
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

    const authToken = await getAuthToken();
    if (!authToken) return;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
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
    const authToken = await getAuthToken();
    if (!authToken) return;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
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

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'search':
        return { title: 'Discover', subtitle: 'Find issues and local stories' };
      case 'assistant':
        return { title: 'CivicBot', subtitle: 'Ask for guidance and support' };
      case 'map':
        return { title: 'Map view', subtitle: 'Explore issues nearby' };
      case 'notifications':
        return { title: 'Alerts', subtitle: 'Your latest civic updates' };
      case 'profile':
        return { title: 'Profile', subtitle: 'Manage your account and preferences' };
      case 'createPost':
        return { title: 'New report', subtitle: 'Share civic issues with the community' };
      default:
        return { title: 'Home', subtitle: 'Stay updated with local civic activity' };
    }
  };

  const renderMainScreen = () => {
    if (activeTab === 'notifications') {
      return <Notifications issues={issues} updates={updates} user={user} />;
    }

    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          user={user}
          issues={issues}
          onLogout={handleLogout}
          onUserUpdated={handleUserUpdated}
          onOpenUpdatePassword={() => setScreen('updatePassword')}
        />
      );
    }

    if (activeTab === 'assistant') {
      return <CivicAssistant user={user} />;
    }

    if (activeTab === 'map') {
      return (
        <IssueMap
          issues={issues}
          onOpenIssue={async (issueId) => {
            const issue = await loadIssueById(issueId);
            if (issue) {
              await handleOpenPostDetail(issue);
            }
          }}
        />
      );
    }

    if (activeTab === 'search') {
      return (
        <SearchScreen
          user={user}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          issues={issues}
          searchResults={searchResults}
          isSearchLoading={isSearchLoading}
          onRefresh={() => {
            if (searchQuery.trim()) {
              loadSearchResults(searchQuery);
            } else {
              loadIssues();
            }
          }}
          onOpenPostDetail={handleOpenPostDetail}
          onOpenCommentForm={handleOpenCommentForm}
          onVote={handleVote}
          onDeletePost={handleDeletePost}
          onShareIssue={handleShareIssue}
        />
      );
    }

    if (activeTab === 'home' && isLoadingIssues && !issues.length) {
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
        updates={updates}
        isLoadingUpdates={isLoadingUpdates}
        isLoading={isLoadingIssues}
        onVote={handleVote}
        onDeletePost={handleDeletePost}
        onLogout={handleLogout}
        onOpenCreatePost={() => setScreen('createPost')}
        onOpenPostDetail={handleOpenPostDetail}        onOpenUpdateIssue={handleOpenIssueFromUpdate}        onOpenCommentForm={handleOpenCommentForm}
        onRefresh={loadIssues}
        onLoadUpdates={loadUpdates}
        onShareIssue={handleShareIssue}
      />
    );
  };

  const headerMeta = getHeaderMeta();
  const shouldShowShellHeader = screen !== 'login' && screen !== 'signup' && screen !== 'resetPassword';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {isNavigatingIssue ? (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <View style={styles.loadingOverlayContent}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingOverlayText}>Opening issue...</Text>
            </View>
          </View>
        ) : null}
        {screen === 'login' ? (
          <Login
            onSignupPress={() => setScreen('signup')}
            onLoginSuccess={handleLoginSuccess}
            onForgotPasswordPress={(email) => {
              setInitialForgotPasswordEmail(email || '');
              setScreen('forgotPassword');
            }}
          />
        ) : screen === 'signup' ? (
          <Signup onLoginPress={() => setScreen('login')} />
        ) : screen === 'resetPassword' ? (
          <ResetPassword onBack={() => {
            setScreen('login');
            setIsResetPasswordFlow(false);
          }} />
        ) : screen === 'forgotPassword' ? (
          <ForgotPassword onBack={() => setScreen('login')} initialEmail={initialForgotPasswordEmail} />
        ) : screen === 'createPost' ? (
          <CreatePost
            user={user}
            onPostCreated={handleCreatePost}
            onCancel={() => setScreen('feeds')}
          />
        ) : screen === 'updatePassword' ? (
          <UpdatePassword
            user={user}
            onBack={() => setScreen('feeds')}
          />
        ) : screen === 'postDetail' ? (
          <Post
            issue={selectedIssue}
            comments={selectedIssueComments}
            issueUpdates={selectedIssueUpdates}
            isLoadingComments={isLoadingComments}
            isLoadingIssueUpdates={isLoadingIssueUpdates}
            onVote={handleVote}
            onDelete={handleDeletePost}
            onShare={handleShareIssue}
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
            {shouldShowShellHeader ? (
              <View style={styles.appHeader}>
                <View>
                  <Text style={styles.headerTitle}>{headerMeta.title}</Text>
                  <Text style={styles.headerSubtitle}>{headerMeta.subtitle}</Text>
                </View>
              </View>
            ) : null}
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

              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('search')}>
                <View style={[styles.tabIconWrap, activeTab === 'search' && styles.tabIconWrapActive]}>
                  <Feather
                    name="search"
                    size={20}
                    color={activeTab === 'search' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.bottomLabel, activeTab === 'search' && styles.bottomLabelActive]}>
                  Search
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('assistant')}>
                <View style={[styles.tabIconWrap, activeTab === 'assistant' && styles.tabIconWrapActive]}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={20}
                    color={activeTab === 'assistant' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.bottomLabel, activeTab === 'assistant' && styles.bottomLabelActive]}>
                  CivicBot
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('map')}>
                <View style={[styles.tabIconWrap, activeTab === 'map' && styles.tabIconWrapActive]}>
                  <MaterialCommunityIcons
                    name="map-marker-radius-outline"
                    size={20}
                    color={activeTab === 'map' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.bottomLabel, activeTab === 'map' && styles.bottomLabelActive]}>
                  Map
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('notifications')}>
                <View style={[styles.tabIconWrap, activeTab === 'notifications' && styles.tabIconWrapActive]}>
                  <Feather
                    name="bell"
                    size={20}
                    color={activeTab === 'notifications' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.bottomLabel, activeTab === 'notifications' && styles.bottomLabelActive]}>
                  Alerts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('profile')}>
                <View style={[styles.tabIconWrap, activeTab === 'profile' && styles.tabIconWrapActive]}>
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={20}
                    color={activeTab === 'profile' ? '#0B2D5C' : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.bottomLabel, activeTab === 'profile' && styles.bottomLabelActive]}>
                  Profile
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
    backgroundColor: '#EEF4FF',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#EEF4FF',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    height: 74,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
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
    backgroundColor: '#DBEAFE',
  },
  bottomCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#2563EB',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.64)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingOverlayContent: {
    width: '80%',
    maxWidth: 320,
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
