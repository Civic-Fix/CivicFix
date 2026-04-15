import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const IssueCard = ({ issue, onVote }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: issue.image }} style={styles.issueImage} />
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.titleText}>{issue.author}</Text>
            <Text style={styles.handleText}>{issue.handle}</Text>
          </View>
          <Text style={styles.timeText}>{issue.time}</Text>
        </View>

        <Text style={styles.locationText}>{issue.location}</Text>
        <Text style={styles.issueText}>{issue.brief}</Text>

        <View style={styles.metaRow}>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>{issue.status}</Text>
          </View>
          <Text style={styles.metaAction}>Share</Text>
          <Text style={styles.metaAction}>Comment</Text>
        </View>

        <View style={styles.voteRow}>
          <TouchableOpacity
            onPress={() => onVote(issue.id, 'upvote')}
            style={styles.voteButton}
          >
            <Text style={styles.voteIcon}>⬆️</Text>
            <Text style={styles.voteCount}>{issue.upvotes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onVote(issue.id, 'downvote')}
            style={styles.voteButton}
          >
            <Text style={styles.voteIcon}>⬇️</Text>
            <Text style={styles.voteCount}>{issue.downvotes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  issueImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
  handleText: {
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 13,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  locationText: {
    color: '#60A5FA',
    fontSize: 13,
    marginBottom: 10,
  },
  issueText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2563EB',
    marginRight: 10,
    marginBottom: 6,
  },
  statusText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 12,
  },
  metaAction: {
    color: '#94A3B8',
    fontSize: 13,
    marginRight: 14,
    marginBottom: 6,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15233C',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 12,
  },
  voteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  voteCount: {
    color: '#EFF6FF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default IssueCard;
