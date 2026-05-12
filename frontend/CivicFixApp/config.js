import { Platform } from 'react-native';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const DEFAULT_ISSUE_SHARE_BASE_URL = 'https://civicfixcoderz.netlify.app';

const getLocalApiBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5001/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  return 'http://localhost:5001/api';
};

export const API_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL || getLocalApiBaseUrl()
);

export const ISSUE_SHARE_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_ISSUE_SHARE_BASE_URL || DEFAULT_ISSUE_SHARE_BASE_URL
);
