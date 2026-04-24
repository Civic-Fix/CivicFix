import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const ActionItem = ({ icon, count, onPress, subtle = false }) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.actionItem}>
    <Feather
      name={icon}
      size={17}
      color={subtle ? '#71717A' : '#D4D4D8'}
      style={styles.actionIcon}
    />
    {typeof count === 'number' ? (
      <Text style={[styles.actionCount, subtle && styles.subtleActionText]}>{count}</Text>
    ) : null}
  </TouchableOpacity>
);

const IssueCard = ({ issue, onVote, onDelete, currentHandle }) => {
  const isOwner = typeof issue.isOwner === 'boolean' ? issue.isOwner : issue.handle === currentHandle;

  return (
    <View style={styles.card}>
      {issue.image ? <Image source={{ uri: issue.image }} style={styles.issueImage} /> : null}

      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <View style={styles.headerIdentity}>
            <Text style={styles.titleText}>{issue.author}</Text>
            <Text style={styles.handleText}>{issue.handle}</Text>
          </View>
          <Text style={styles.timeText}>{issue.time}</Text>
        </View>

        <Text style={styles.issueText}>{issue.brief}</Text>

        <View style={styles.metaRow}>
          {issue.location ? <Text style={styles.locationText}>{issue.location}</Text> : null}
          {issue.status ? (
            <View style={styles.statusChip}>
              <Text style={styles.statusText}>{issue.status}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionBar}>
          <ActionItem icon="message-circle" count={0} />
          <ActionItem 
            icon="arrow-up" 
            count={issue.upvotes} 
            onPress={() => !isOwner && onVote(issue.id, 'upvote')}
            subtle={isOwner}
          />
          <ActionItem icon="share" count={0} />
          <ActionItem
            icon="arrow-down"
            count={issue.downvotes}
            onPress={() => !isOwner && onVote(issue.id, 'downvote')}
            subtle={isOwner}
          />
          {isOwner ? <ActionItem icon="trash-2" onPress={() => onDelete?.(issue.id)} subtle /> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  issueImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#111111',
  },
  cardBody: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 6,
  },
  handleText: {
    color: '#A3A3A3',
    fontSize: 13,
  },
  timeText: {
    color: '#A3A3A3',
    fontSize: 12,
  },
  issueText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  locationText: {
    color: '#A3A3A3',
    fontSize: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  statusChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3F3F46',
    marginBottom: 6,
    backgroundColor: '#090909',
  },
  statusText: {
    color: '#D4D4D8',
    fontWeight: '600',
    fontSize: 11,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#18181B',
    paddingTop: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    minWidth: 40,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionCount: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '600',
  },
  subtleActionText: {
    color: '#71717A',
  },
});

export default IssueCard;
