import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import IssueCard from './IssueCard';
import styles from './FeedsStyles';

const Feeds = ({ user, onLogout, issues, onVote, onDeletePost, onOpenCreatePost }) => {
  const [displayName, setDisplayName] = useState('CivicFix User');
  const [currentHandle, setCurrentHandle] = useState('@civicfixuser');
  const [feedTab, setFeedTab] = useState('forYou');

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

  const visibleIssues =
    feedTab === 'myPosts'
      ? issues.filter((issue) => issue.handle === currentHandle)
      : issues;

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
      </View>

      <ScrollView contentContainerStyle={styles.feedList} showsVerticalScrollIndicator={false}>
        {visibleIssues.map((item) => (
          <IssueCard
            key={item.id}
            issue={item}
            onVote={onVote}
            onDelete={onDeletePost}
            currentHandle={currentHandle}
          />
        ))}

        {!visibleIssues.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No posts here yet</Text>
            <Text style={styles.emptyStateText}>
              Your own reports will appear in My Posts once you publish them.
            </Text>
          </View>
        ) : null}
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
