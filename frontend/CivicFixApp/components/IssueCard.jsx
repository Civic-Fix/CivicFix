import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ActionItem = ({ icon, count, onPress, subtle = false }) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.actionItem}>
    <Feather
      name={icon}
      size={18}
      color={subtle ? '#D1D5DB' : '#6B7280'}
      style={styles.actionIcon}
    />
    {typeof count === 'number' && count > 0 ? (
      <Text style={[styles.actionCount, subtle && styles.subtleActionText]}>{count}</Text>
    ) : null}
  </TouchableOpacity>
);

const IssueCard = ({ issue, onVote, onDelete, currentHandle }) => {
  const isOwner = typeof issue.isOwner === 'boolean' ? issue.isOwner : issue.handle === currentHandle;
  
  const VERIFICATION_BADGES = {
    authority_verified: {
      icon: 'shield-check',
      color: '#B91C1C',
      bgColor: '#FEE2E2',
      borderColor: '#FCA5A5',
      label: 'Authority Verified',
    },
    community_verified: {
      icon: 'account-group',
      color: '#15803D',
      bgColor: '#DCFCE7',
      borderColor: '#86EFAC',
      label: 'Community Verified',
    },
    pending: {
      icon: 'clock-outline',
      color: '#B45309',
      bgColor: '#FEF3C7',
      borderColor: '#FCD34D',
      label: 'Pending',
    },
  };

  const verificationBadge = VERIFICATION_BADGES[issue.verification_status] ?? VERIFICATION_BADGES.pending;

  return (
    <View style={styles.card}>
      {/* Header with Avatar and Info */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          {/* Avatar */}
          <View style={[styles.avatar, verificationBadge.color === '#16A34A' && styles.avatarVerified]}>
            <Text style={styles.avatarText}>{issue.author.charAt(0).toUpperCase()}</Text>
          </View>
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.username}>{issue.author}</Text>
            <Text style={styles.userHandle}>{issue.handle}</Text>
          </View>
        </View>

        {/* Verification Badge */}
        <View style={[
          styles.verificationBadge,
          { backgroundColor: verificationBadge.bgColor, borderColor: verificationBadge.borderColor },
        ]}>
          <MaterialCommunityIcons
            name={verificationBadge.icon}
            size={13}
            color={verificationBadge.color}
          />
          <Text style={[styles.verificationLabel, { color: verificationBadge.color }]}>
            {verificationBadge.label}
          </Text>
        </View>
      </View>

      {/* Issue Image */}
      {issue.image ? (
        <Image source={{ uri: issue.image }} style={styles.issueImage} />
      ) : (
        <View style={styles.placeholderImage} />
      )}

      {/* Card Content */}
      <View style={styles.cardBody}>
        {/* Title */}
        {issue.title || issue.brief ? (
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>{issue.title || issue.brief.split('\n')[0]}</Text>
          </View>
        ) : null}

        {/* Description */}
        {issue.brief ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>{issue.brief}</Text>
          </View>
        ) : null}

        {/* Location and Status Row */}
        <View style={styles.metaRow}>
          {issue.location ? (
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={14} color="#666666" />
              <Text style={styles.locationText}>{issue.location}</Text>
            </View>
          ) : null}
          
          {issue.status ? (
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{issue.status}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <ActionItem icon="message-circle" count={0} />
          <ActionItem
            icon="arrow-up"
            count={issue.upvotes}
            onPress={() => onVote(issue.id, 'upvote')}
            subtle={Boolean(issue.currentUserUpvoteId)}
          />
          <ActionItem
            icon="arrow-down"
            count={issue.downvotes}
            onPress={() => onVote(issue.id, 'downvote')}
            subtle={Boolean(issue.currentUserDownvoteId)}
          />
          <ActionItem icon="share-2" count={0} />
          {isOwner ? (
            <ActionItem icon="trash-2" onPress={() => onDelete?.(issue.id)} subtle />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Header Styles */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarVerified: {
    backgroundColor: '#D1FAE5',
  },
  avatarText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 13,
  },
  userHandle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
    gap: 4,
  },
  verificationLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Image Styles */
  issueImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  placeholderImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },

  /* Content Styles */
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  titleSection: {
    marginBottom: 8,
  },
  titleText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
  },
  descriptionSection: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  descriptionText: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 20,
  },

  /* Meta Styles */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#666666',
    fontSize: 12,
    marginLeft: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  statusText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 12,
  },

  /* Action Bar Styles */
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
  },
  actionIcon: {
    marginRight: 4,
  },
  actionCount: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
  },
  subtleActionText: {
    color: '#999999',
  },
});

export default IssueCard;
