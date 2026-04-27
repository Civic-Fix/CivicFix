import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const STATUS_COLORS = {
  Reported:     { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' },
  'In Progress':{ bg: '#DBEAFE', border: '#93C5FD', text: '#1D4ED8' },
  Resolved:     { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D' },
  Closed:       { bg: '#F3F4F6', border: '#D1D5DB', text: '#4B5563' },
};

const getStatusStyle = (status) =>
  STATUS_COLORS[status] || { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' };

const AVATAR_COLORS = ['#4F46E5', '#0891B2', '#DC2626', '#7C3AED', '#C2410C', '#15803D'];
const getAvatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const VoteButton = ({ icon, count, active, activeColor, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.voteBtn}>
    <View style={[styles.voteBtnInner, active && { backgroundColor: activeColor + '20' }]}>
      <Feather name={icon} size={16} color={active ? activeColor : '#9CA3AF'} />
      {typeof count === 'number' && count > 0 ? (
        <Text style={[styles.voteCount, active && { color: activeColor }]}>{count}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const IssueCard = ({ issue, onVote, onDelete, currentHandle }) => {
  const isOwner = typeof issue.isOwner === 'boolean' ? issue.isOwner : issue.handle === currentHandle;
  const avatarColor = getAvatarColor(issue.author);
  const statusStyle = getStatusStyle(issue.status);

  const VERIFICATION_BADGES = {
    authority_verified: { icon: 'shield-check', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'Authority' },
    community_verified: { icon: 'account-group', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC', label: 'Community' },
    pending:            { icon: 'clock-outline',  color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', label: 'Pending' },
  };

  const badge = VERIFICATION_BADGES[issue.verification_status] ?? VERIFICATION_BADGES.pending;

  return (
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
      {issue.image ? (
        <Image source={{ uri: issue.image }} style={styles.issueImage} resizeMode="cover" />
      ) : null}

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.brief} numberOfLines={3}>{issue.brief}</Text>

        <View style={styles.chips}>
          {issue.location ? (
            <View style={styles.locationChip}>
              <Feather name="map-pin" size={11} color="#6B7280" />
              <Text style={styles.locationText} numberOfLines={1}>{issue.location}</Text>
            </View>
          ) : null}

          {issue.status ? (
            <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{issue.status}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Feather name="message-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <VoteButton
            icon="arrow-up"
            count={issue.upvotes}
            active={Boolean(issue.currentUserUpvoteId)}
            activeColor="#16A34A"
            onPress={() => onVote(issue.id, 'upvote')}
          />

          <VoteButton
            icon="arrow-down"
            count={issue.downvotes}
            active={Boolean(issue.currentUserDownvoteId)}
            activeColor="#DC2626"
            onPress={() => onVote(issue.id, 'downvote')}
          />

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Feather name="share-2" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {isOwner ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => onDelete?.(issue.id)}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={15} color="#EF4444" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorHandle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  timeStamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  issueImage: {
    width: '100%',
    height: 180,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  brief: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flexShrink: 1,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 8,
    gap: 4,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  deleteBtn: {
    marginLeft: 'auto',
  },
  voteBtn: {
    marginLeft: 2,
  },
  voteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default IssueCard;
