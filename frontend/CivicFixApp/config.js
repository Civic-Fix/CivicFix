import { Platform } from 'react-native';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const DEFAULT_ISSUE_SHARE_BASE_URL = 'https://civicfixcoderz.netlify.app';

const getLocalApiBaseUrl = () => {
  return 'http://localhost:5001/api';
};

export const API_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL || getLocalApiBaseUrl()
);

export const ISSUE_SHARE_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_ISSUE_SHARE_BASE_URL || DEFAULT_ISSUE_SHARE_BASE_URL
);
