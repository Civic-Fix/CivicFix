import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'localNotifications';
const DISMISSED_STORAGE_KEY = 'dismissedLocalNotifications';
let nativeNotifications = null;
let notificationHandlerConfigured = false;

const getScopedKey = (baseKey, userId) => {
  const safeUserId = userId ? String(userId) : 'guest';
  return `${baseKey}:${safeUserId}`;
};

const getNativeNotifications = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!nativeNotifications) {
    nativeNotifications = await import('expo-notifications');
  }

  if (!notificationHandlerConfigured) {
    nativeNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationHandlerConfigured = true;
  }

  return nativeNotifications;
};

export const requestNotificationPermissions = async () => {
  const Notifications = await getNativeNotifications();
  if (!Notifications) {
    return { status: 'granted' };
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return { status };
};

export const scheduleLocalNotification = async ({ title, body, data = {} }) => {
  const Notifications = await getNativeNotifications();
  if (!Notifications) {
    return null;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null,
  });
};

export const getStoredNotifications = async (userId) => {
  const stored = await AsyncStorage.getItem(getScopedKey(STORAGE_KEY, userId));
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const seen = new Set();
    return parsed.filter((item) => {
      if (!item?.id || seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
};

export const saveStoredNotifications = async (items, userId) => {
  await AsyncStorage.setItem(getScopedKey(STORAGE_KEY, userId), JSON.stringify(items));
};

export const addStoredNotifications = async (newItems, userId) => {
  const items = await getStoredNotifications(userId);
  const existingIds = new Set(items.map((item) => item.id));
  const uniqueNewItems = newItems.filter((item) => item?.id && !existingIds.has(item.id));
  const next = [...uniqueNewItems, ...items].slice(0, 12);
  await saveStoredNotifications(next, userId);
  return next;
};

export const getDismissedNotificationIds = async (userId) => {
  const stored = await AsyncStorage.getItem(getScopedKey(DISMISSED_STORAGE_KEY, userId));
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const removeStoredNotification = async (id, userId) => {
  const items = await getStoredNotifications(userId);
  const removedItem = items.find((item) => item.id === id);
  const next = items.filter((item) => item.id !== id);
  const dismissedIds = await getDismissedNotificationIds(userId);
  const dismissedId = removedItem?.sourceIssueId || id;
  const nextDismissedIds = Array.from(new Set([...dismissedIds, dismissedId])).slice(-100);
  await Promise.all([
    saveStoredNotifications(next, userId),
    AsyncStorage.setItem(getScopedKey(DISMISSED_STORAGE_KEY, userId), JSON.stringify(nextDismissedIds)),
  ]);
  return next;
};
