import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  addStoredNotifications,
  getDismissedNotificationIds,
  getStoredNotifications,
  removeStoredNotification,
  requestNotificationPermissions,
  scheduleLocalNotification,
} from '../services/notificationService';

const Notifications = ({ issues, updates = [], user }) => {
  const [items, setItems] = useState([]);
  const [permissionState, setPermissionState] = useState('unknown');
  const userId = user?.id || user?.email || 'guest';

  useEffect(() => {
    const loadItems = async () => {
      const stored = await getStoredNotifications(userId);
      setItems(stored);
    };

    loadItems();
  }, [userId]);

  useEffect(() => {
    const syncItems = async () => {
      const feedItems = issues.slice(0, 4).map((issue) => ({
        id: `feed-${issue.id}`,
        dismissalKey: `feed-${issue.id}`,
        title: `${issue.author} posted an update`,
        body: issue.brief,
        time: issue.time,
        category: 'feed',
      }));

      const updateItems = updates
        .filter((update) => issues.some((issue) => issue.id === update.issue_id && issue.isOwner))
        .slice(0, 8)
        .map((update) => ({
          id: `issue-update-${update.id}`,
          dismissalKey: `issue-update-${update.id}`,
          sourceIssueId: update.issue_id,
          title: `New update on ${update.issueTitle || 'your issue'}`,
          body: update.content || 'An official update was posted for your issue.',
          time: update.time,
          category: 'issue-update',
        }));

      const seeded = [...updateItems, ...feedItems];

      if (!seeded.length) {
        return;
      }

      const [storedItems, dismissedIssueIds] = await Promise.all([
        getStoredNotifications(userId),
        getDismissedNotificationIds(userId),
      ]);
      const existingIds = new Set(storedItems.map((item) => item.id));
      const dismissedIds = new Set(dismissedIssueIds);
      const newItems = seeded.filter(
        (item) => !existingIds.has(item.id) && !dismissedIds.has(item.dismissalKey || item.sourceIssueId || item.id)
      );

      if (newItems.length) {
        const nextItems = await addStoredNotifications(newItems, userId);
        setItems(nextItems);
      }

      const permissionResult = await requestNotificationPermissions();
      if (Platform.OS === 'web') {
        setPermissionState(permissionResult.status);
      }

      newItems.forEach((item) => {
        scheduleLocalNotification({
          title: item.title,
          body: item.body,
          data: { id: item.id },
        });
      });
    };

    syncItems();
  }, [issues, updates, userId]);

  const handleRemove = async (id) => {
    const next = await removeStoredNotification(id, userId);
    setItems(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Recent civic feed updates near you.</Text>
      </View>

      {Platform.OS === 'web' && permissionState === 'denied' ? (
        <View style={styles.permissionNotice}>
          <Feather name="info" size={14} color="#C2410C" />
          <Text style={styles.permissionNoticeText}>Browser notifications are blocked, so updates will appear in this list instead.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="bell-off" size={28} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyBody}>Updates from the civic feed will appear here.</Text>
          </View>
        ) : (
          items.map((item) => {
            const isIssueUpdate = item.category === 'issue-update';

            return (
            <View key={item.id} style={[styles.card, isIssueUpdate && styles.updateCard]}>
              <View style={[styles.iconWrap, isIssueUpdate && styles.updateIconWrap]}>
                <MaterialCommunityIcons
                  name={isIssueUpdate ? 'progress-clock' : 'bell-ring-outline'}
                  size={17}
                  color={isIssueUpdate ? '#2563EB' : '#16A34A'}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.cardBody}>{item.body}</Text>
              </View>
              <View style={styles.actions}>
                <Text style={styles.time}>{item.time}</Text>
                <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeButton}>
                  <MaterialCommunityIcons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 3,
    fontSize: 12,
  },
  permissionNotice: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  permissionNoticeText: {
    flex: 1,
    color: '#9A2C00',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  updateCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  updateIconWrap: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  copy: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardBody: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  time: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Notifications;
