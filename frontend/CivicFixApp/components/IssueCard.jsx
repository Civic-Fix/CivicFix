import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
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

const formatCategoryLabel = (category) =>
  category
    ? category
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

const formatConfidence = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${Math.round(numericValue * 100)}%` : '';
};

const runAction = (event, callback) => {
  event?.stopPropagation?.();
  callback?.();
};

const VoteButton = ({ icon, count, active, activeColor, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={(event) => runAction(event, onPress)} style={styles.voteBtn}>
    <View style={[styles.voteBtnInner, active && { backgroundColor: activeColor + '20' }]}>
      <Feather name={icon} size={16} color={active ? activeColor : '#9CA3AF'} />
      {typeof count === 'number' && count > 0 ? (
        <Text style={[styles.voteCount, active && { color: activeColor }]}>{count}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const IssueCard = ({ issue, onVote, onDelete, currentHandle, onPress, onCommentPress, onShare }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const isOwner = typeof issue.isOwner === 'boolean' ? issue.isOwner : issue.handle === currentHandle;
  const avatarColor = getAvatarColor(issue.author);
  const statusStyle = getStatusStyle(issue.status);

  const VERIFICATION_BADGES = {
    authority_verified: { icon: 'shield-check', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'Authority Verified' },
    community_verified: { icon: 'account-group', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC', label: 'Community verified' },
    pending:            { icon: 'clock-outline',  color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', label: 'Pending' },
  };

  const badge = VERIFICATION_BADGES[issue.verification_status] ?? VERIFICATION_BADGES.pending;
  const locationText = [issue.locality || issue.location, issue.coordinateLocation]
    .filter(Boolean)
    .join(' - ');
  const carouselImages = issue.images?.length ? issue.images : issue.image ? [{ uri: issue.image }] : [];
  const aiCategoryLabel = issue.aiCategoryLabel || formatCategoryLabel(issue.aiCategory);
  const aiConfidence = formatConfidence(issue.aiCategoryConfidence);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {!issue.isAnonymous && issue.avatar_url && !issue.avatar_url.startsWith('data:') ? (
          <Image
            source={{ uri: issue.avatar_url }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarColor + '22' }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {issue.author.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

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
        <ImageCarousel images={carouselImages} height={160} />
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

        {issue.aiPending || aiCategoryLabel || issue.aiDuplicateOf ? (
          <View style={styles.aiInsightRow}>
            <View style={styles.aiChip}>
              <MaterialCommunityIcons name="robot-outline" size={13} color="#1D4ED8" />
              <Text style={styles.aiChipText}>
                {issue.aiPending ? 'AI checking' : `AI: ${aiCategoryLabel}${aiConfidence ? ` ${aiConfidence}` : ''}`}
              </Text>
            </View>
            {issue.aiSeverity ? (
              <View style={styles.aiSeverityChip}>
                <Text style={styles.aiSeverityText}>{issue.aiSeverity}</Text>
              </View>
            ) : null}
            {issue.aiDuplicateOf ? (
              <View style={styles.aiDuplicateChip}>
                <Feather name="copy" size={12} color="#B45309" />
                <Text style={styles.aiDuplicateText}>Possible duplicate</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {issue.aiSummary ? (
          <View style={styles.aiSummaryWrap}>
            <TouchableOpacity
              style={styles.aiSummaryToggle}
              activeOpacity={0.75}
              onPress={(event) => runAction(event, () => setShowAiSummary((prev) => !prev))}
            >
              <View style={styles.aiSummaryToggleLeft}>
                <MaterialCommunityIcons name="text-box-search-outline" size={14} color="#1D4ED8" />
                <Text style={styles.aiSummaryToggleText}>
                  {showAiSummary ? 'Hide AI summary' : 'Show AI summary'}
                </Text>
              </View>
              <Feather name={showAiSummary ? 'chevron-up' : 'chevron-down'} size={14} color="#1D4ED8" />
            </TouchableOpacity>
            {showAiSummary ? (
              <Text style={styles.aiSummaryText}>{issue.aiSummary}</Text>
            ) : null}
          </View>
        ) : null}
        
        <Text style={styles.brief} numberOfLines={isExpanded ? 0 : 3}>
          {issue.brief}
        </Text>
        
        {issue.brief.length > 150 && (
          <TouchableOpacity 
            style={styles.seeMoreButton} 
            onPress={(event) => runAction(event, () => setIsExpanded(!isExpanded))}
            activeOpacity={0.7}
          >
            <Text style={styles.seeMoreText}>
              {isExpanded ? 'See less' : 'See more'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.metaRow}>
          {locationText ? (
            <View style={styles.locationBlock}>
              <Feather name="map-pin" size={13} color="#0F766E" style={{ marginTop: 2, flexShrink: 0 }} />
              <View style={styles.locationContent}>
                <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">{locationText}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.locationPlaceholder} />
          )}

        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionsLeft}>
              <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={(event) => runAction(event, () => onCommentPress?.(issue))}
            >
              <Feather name="message-circle" size={14} color="#9CA3AF" />
            </TouchableOpacity>

            <VoteButton
              icon="arrow-up"
              count={issue.upvotes}
              active={Boolean(issue.currentUserUpvoteId)}
              activeColor="#16A34A"
              onPress={() => onVote?.(issue.id, 'upvote')}
            />

            <VoteButton
              icon="arrow-down"
              count={issue.downvotes}
              active={Boolean(issue.currentUserDownvoteId)}
              activeColor="#DC2626"
              onPress={() => onVote?.(issue.id, 'downvote')}
            />

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={(event) => runAction(event, () => onShare?.(issue))}
            >
              <Feather name="share-2" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRight}>
            {isOwner ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={(event) => runAction(event, () => onDelete?.(issue.id))}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={13} color="#EF4444" />
              </TouchableOpacity>
            ) : null}
            <Text style={styles.postTime}>{issue.fullTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 16,
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
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
    lineHeight: 20,
  },
  brief: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 10,
  },
  aiInsightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiChipText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  aiSeverityChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  aiSeverityText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  aiDuplicateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  aiDuplicateText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  aiSummaryWrap: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
  },
  aiSummaryToggle: {
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  aiSummaryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    minWidth: 0,
  },
  aiSummaryToggleText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  aiSummaryText: {
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  seeMoreButton: {
    marginBottom: 10,
  },
  seeMoreText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
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
    gap: 6,
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },
  locationContent: {
    flex: 1,
    minWidth: 0,
  },
  locationText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 16,
    overflow: 'hidden',
    marginRight: 4,
  },
  locationPlaceholder: {
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6,
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
    padding: 6,
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
    paddingHorizontal: 8,
    paddingVertical: 5,
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
});

export default IssueCard;
