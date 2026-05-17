import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import IssueCard from './IssueCard';
import styles from './FeedsStyles';

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
    : '';

const Feeds = ({ user, onLogout, issues, updates, isLoadingUpdates, onVote, onDeletePost, onOpenCreatePost, isLoading, onRefresh, onLoadUpdates, onOpenPostDetail, onOpenUpdateIssue, onOpenCommentForm, onShareIssue }) => {
  const [displayName, setDisplayName] = useState('CivicFix User');
  const [currentHandle, setCurrentHandle] = useState('@civicfixuser');
  const [feedTab, setFeedTab] = useState('forYou');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      setCurrentHandle(`@${user.name.replace(/\s+/g, '').toLowerCase()}`);
    } else if (user?.email) {
      const derivedName = user.email.split('@')[0];
      setDisplayName(derivedName);
      setCurrentHandle(`@${derivedName.replace(/\s+/g, '').toLowerCase()}`);
    }
  }, [user]);

  useEffect(() => {
    if (feedTab === 'updates' || feedTab === 'myUpdates') {
      onLoadUpdates?.();
    }
  }, [feedTab, onLoadUpdates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (feedTab === 'updates' || feedTab === 'myUpdates') {
        await onLoadUpdates?.();
      } else {
        await onRefresh?.();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const visibleIssues =
    feedTab === 'myPosts'
      ? issues.filter((issue) => issue.isOwner)
      : issues;

  const myIssueUpdates = updates.filter((update) =>
    issues.some((issue) => issue.id === update.issue_id && issue.isOwner)
  );

  const activeUpdateList = feedTab === 'myUpdates' ? myIssueUpdates : updates;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.feedHeading}>
          <Text style={styles.pageTitle}>CivicFix</Text>
          <Text style={styles.pageSubtitle}>
            Welcome back, {displayName}. Track local reports and tap the plus button to add one.
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedTabs}>
        <TouchableOpacity style={styles.feedTabButton} onPress={() => setFeedTab('forYou')}>
          <Text style={[styles.feedTabText, feedTab === 'forYou' && styles.feedTabTextActive]}>
            For You
          </Text>
          {feedTab === 'forYou' ? <View style={styles.feedTabIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.feedTabButton} onPress={() => setFeedTab('myPosts')}>
          <Text style={[styles.feedTabText, feedTab === 'myPosts' && styles.feedTabTextActive]}>
            My Posts
          </Text>
          {feedTab === 'myPosts' ? <View style={styles.feedTabIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.feedTabButton} onPress={() => setFeedTab('myUpdates')}>
          <Text style={[styles.feedTabText, feedTab === 'myUpdates' && styles.feedTabTextActive]}>
            My Updates
          </Text>
          {feedTab === 'myUpdates' ? <View style={styles.feedTabIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.feedTabButton} onPress={() => setFeedTab('updates')}>
          <Text style={[styles.feedTabText, feedTab === 'updates' && styles.feedTabTextActive]}>
            Updates
          </Text>
          {feedTab === 'updates' ? <View style={styles.feedTabIndicator} /> : null}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.feedList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor="#16A34A"
          />
        }
      >
        {feedTab === 'updates' || feedTab === 'myUpdates' ? (
          isLoadingUpdates && !activeUpdateList.length ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#16A34A" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyStateTitle}>Loading updates...</Text>
            </View>
          ) : activeUpdateList.length > 0 ? (
            activeUpdateList.map((update) => (
              <Pressable
                key={update.id}
                onPress={() => onOpenUpdateIssue?.(update)}
                android_ripple={{ color: '#E2E8F0' }}
                style={({ pressed, hovered }) => [
                  styles.updateCard,
                  pressed && styles.updateCardPressed,
                  hovered && styles.updateCardHover,
                ]}
              >
                <View style={styles.updateCardHeader}>
                  <Text style={styles.updateTitle}>{update.issueTitle}</Text>
                  {update.issueStatus ? (
                    <View style={styles.updateStatusBadge}>
                      <Text style={styles.updateStatusText}>{formatStatus(update.issueStatus)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.updateBody}>{update.content}</Text>
                <View style={styles.updateMetaRow}>
                  <View style={styles.updateMetaItem}>
                    <Feather name="map-pin" size={12} color="#64748B" />
                    <Text style={styles.updateMetaText}>{update.issueLocality || 'Unknown area'}</Text>
                  </View>
                  <View style={styles.updateMetaItem}>
                    <Feather name="clock" size={12} color="#64748B" />
                    <Text style={styles.updateMetaText}>{update.time}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No updates yet</Text>
              <Text style={styles.emptyStateText}>
                {feedTab === 'myUpdates'
                  ? 'Updates for your reports will appear here once there is progress.'
                  : 'Progress updates from issues will appear here.'}
              </Text>
            </View>
          )
        ) : isLoading && !issues.length ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#16A34A" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyStateTitle}>Loading civic reports...</Text>
          </View>
        ) : visibleIssues.length > 0 ? (
          visibleIssues.map((item) => (
            <IssueCard
              key={item.id}
              issue={item}
              onVote={onVote}
              onDelete={onDeletePost}
              currentHandle={currentHandle}
              onPress={onOpenPostDetail ? () => onOpenPostDetail(item) : undefined}
              onCommentPress={onOpenCommentForm ? () => onOpenCommentForm(item) : undefined}
              onShare={onShareIssue ? () => onShareIssue(item) : undefined}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No posts here yet</Text>
            <Text style={styles.emptyStateText}>
              {feedTab === 'myPosts' 
                ? 'Your own reports will appear here once you publish them.'
                : 'Be the first to report a civic issue in your area.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.fabButton}
        onPress={onOpenCreatePost}
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Feeds;
