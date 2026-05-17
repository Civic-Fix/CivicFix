import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ImageCarousel from './ImageCarousel';

const STATUS_COLORS = {
  Reported: { bg: '#EAF2FF', border: '#B8CEF3', text: '#0B2D5C' },
  'In Progress': { bg: '#CCFBF1', border: '#5EEAD4', text: '#0F766E' },
  Resolved: { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D' },
  Closed: { bg: '#F3F4F6', border: '#D1D5DB', text: '#4B5563' },
};

const getStatusStyle = (status) =>
  STATUS_COLORS[status] || { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' };

const AVATAR_COLORS = ['#4F46E5', '#0891B2', '#DC2626', '#7C3AED', '#C2410C', '#15803D'];
const getAvatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const VoteButton = ({ icon, count, active, activeColor, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.voteBtn} disabled={!onPress}>
    <View style={[styles.voteBtnInner, active && { backgroundColor: activeColor + '20' }]}>
      <Feather name={icon} size={16} color={active ? activeColor : '#9CA3AF'} />
      {typeof count === 'number' && count > 0 ? (
        <Text style={[styles.voteCount, active && { color: activeColor }]}>{count}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const formatCommentTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
};

const Post = ({ issue, comments = [], issueUpdates = [], isLoadingComments, isLoadingIssueUpdates, onVote, onDelete, currentHandle, onBack, onOpenCommentForm, onDeleteComment, onVoteComment, onShare }) => {
  if (!issue) return null;

  const isOwner = typeof issue.isOwner === 'boolean' ? issue.isOwner : issue.handle === currentHandle;
  const avatarColor = getAvatarColor(issue.author);
  const statusStyle = getStatusStyle(issue.status);

  const VERIFICATION_BADGES = {
    authority_verified: { icon: 'shield-check', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'Authority' },
    community_verified: { icon: 'account-group', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC', label: 'Community' },
    pending:            { icon: 'clock-outline',  color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', label: 'Pending' },
  };

  const badge = VERIFICATION_BADGES[issue.verification_status] ?? VERIFICATION_BADGES.pending;
  const locationText = [issue.locality || issue.location, issue.coordinateLocation]
    .filter(Boolean)
    .join(' - ');
  const carouselImages = issue.images?.length ? issue.images : issue.image ? [{ uri: issue.image }] : [];

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: avatarColor + '22' }]}>
              <Text style={[styles.avatarText, { color: avatarColor }]}>
                {issue.author.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.authorName}>{issue.author}</Text>
              <View style={styles.metaLine}>
                <Text style={styles.authorHandle}>{issue.handle}</Text>
                <Text style={styles.dot}> · </Text>
                <Text style={styles.timeStamp}>{issue.time}</Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <MaterialCommunityIcons name={badge.icon} size={12} color={badge.color} />
              <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>

          {/* Image */}
          {carouselImages.length ? (
            <ImageCarousel images={carouselImages} height={240} />
          ) : null}

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{issue.title}</Text>
              {issue.status ? (
                <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{issue.status}</Text>
                </View>
              ) : null}
            </View>
            
            <Text style={styles.brief}>
              {issue.brief}
            </Text>

            <View style={styles.metaRow}>
              {locationText ? (
                <View style={styles.locationBlock}>
                  <Feather name="map-pin" size={15} color="#0F766E" />
                  <View style={styles.locationContent}>
                    <Text style={styles.locationLabel}>Locality</Text>
                    <Text style={styles.locationText}>{locationText}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.locationPlaceholder} />
              )}
            </View>

            <View style={styles.updatesSection}>
              <View style={styles.updatesHeader}>
                <Text style={styles.updatesTitle}>Issue Timeline</Text>
                <Text style={styles.updatesSubtitle}>Recent progress updates and status changes</Text>
              </View>

              {isLoadingIssueUpdates ? (
                <View style={styles.updatesLoading}>
                  <ActivityIndicator size="small" color="#16A34A" />
                  <Text style={styles.updatesLoadingText}>Loading updates...</Text>
                </View>
              ) : issueUpdates.length > 0 ? (
                issueUpdates.map((update) => (
                  <View key={update.id} style={styles.issueUpdateItem}>
                    <View style={styles.issueUpdateMarker} />
                    <View style={styles.issueUpdateItemCard}>
                      <View style={styles.issueUpdateHeader}>
                        <Text style={styles.issueUpdateTitle}>{update.type ? `${update.type.replace(/_/g, ' ')} update` : 'Update'}</Text>
                        {update.issueStatus ? (
                          <View style={styles.issueUpdateBadge}>
                            <Text style={styles.issueUpdateBadgeText}>{update.issueStatus}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.issueUpdateDescription}>{update.content}</Text>
                      <Text style={styles.issueUpdateTime}>{formatCommentTime(update.created_at || update.time)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.updatesEmptyState}>
                  <Text style={styles.updatesEmptyTitle}>No updates yet</Text>
                  <Text style={styles.updatesEmptyText}>This issue has not received any progress reports.</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <View style={styles.actionsLeft}>
<TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={onOpenCommentForm ? () => onOpenCommentForm(issue) : undefined}
            >
                  <Feather name="message-circle" size={14} color="#9CA3AF" />
                </TouchableOpacity>

                <VoteButton
                  icon="arrow-up"
                  count={issue.upvotes}
                  active={Boolean(issue.currentUserUpvoteId)}
                  activeColor="#16A34A"
                  onPress={onVote ? () => onVote(issue.id, 'upvote') : undefined}
                />

                <VoteButton
                  icon="arrow-down"
                  count={issue.downvotes}
                  active={Boolean(issue.currentUserDownvoteId)}
                  activeColor="#DC2626"
                  onPress={onVote ? () => onVote(issue.id, 'downvote') : undefined}
                />

                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={onShare ? () => onShare(issue) : undefined}
                  disabled={!onShare}
                >
                  <Feather name="share-2" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionsRight}>
                {isOwner ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => onDelete?.(issue.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={13} color="#EF4444" />
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.postTime}>{issue.fullTime}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {isLoadingComments ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={styles.commentsLoadingText}>Loading comments...</Text>
            </View>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentHandle}>{comment.handle}</Text>
                  </View>
                  <Text style={styles.commentTime}>{formatCommentTime(comment.createdAt)}</Text>
                </View>

                <Text style={styles.commentText}>{comment.description}</Text>

                <View style={styles.commentActions}>
                  <View style={styles.commentActionGroup}>
                    <TouchableOpacity
                      style={styles.commentActionBtn}
                      activeOpacity={0.7}
                      onPress={() => onVoteComment?.(comment.id, 'upvote')}
                    >
                      <Feather name="arrow-up" size={14} color="#16A34A" />
                      <Text style={styles.commentVoteCount}>{comment.vote}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.commentActionBtn}
                      activeOpacity={0.7}
                      onPress={() => onVoteComment?.(comment.id, 'downvote')}
                    >
                      <Feather name="arrow-down" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  {comment.isOwner ? (
                    <TouchableOpacity
                      style={styles.commentActionBtn}
                      activeOpacity={0.7}
                      onPress={() => onDeleteComment?.(comment.id)}
                    >
                      <Feather name="trash-2" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.commentsEmptyState}>
              <Text style={styles.commentsPlaceholder}>No comments here yet.</Text>
              <Text style={styles.commentsEmptySubtext}>Tap the comment icon to add the first reply.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorHandle: {
    fontSize: 12,
    color: '#64748B',
  },
  dot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  timeStamp: {
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#102A43',
    lineHeight: 23,
  },
  brief: {
    fontSize: 15, // Slightly larger text
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  locationContent: {
    flex: 1,
    minWidth: 0,
  },
  locationLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 18,
  },
  locationPlaceholder: {
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  updatesSection: {
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updatesHeader: {
    marginBottom: 12,
  },
  updatesTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  updatesSubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  updatesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  updatesLoadingText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  issueUpdateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  issueUpdateMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0B2D5C',
    marginTop: 10,
    marginRight: 12,
  },
  issueUpdateItemCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  issueUpdateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  issueUpdateTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  issueUpdateBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  issueUpdateBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  issueUpdateDescription: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  issueUpdateTime: {
    color: '#64748B',
    fontSize: 12,
  },
  updatesEmptyState: {
    paddingVertical: 18,
  },
  updatesEmptyTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  updatesEmptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  voteBtn: {
    marginLeft: 0,
  },
  voteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  postTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  commentsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  commentsPlaceholder: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  commentsEmptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  commentsLoadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  commentsEmptyState: {
    paddingTop: 8,
  },
  commentCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  commentHandle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  commentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentVoteCount: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});

export default Post;
