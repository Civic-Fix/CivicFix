import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const AUTH_KEYS = ['authToken', 'refreshToken', 'userInfo'];
let refreshPromise = null;

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function clearStoredSession() {
  await AsyncStorage.multiRemove(AUTH_KEYS);
}

export async function refreshStoredSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshStoredSessionOnce().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function refreshStoredSessionOnce() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const result = await readJsonSafely(response);

  if (!response.ok) {
    await clearStoredSession();
    throw new Error(result.error || 'Unable to refresh session');
  }

  const nextAccessToken = result.session?.accessToken;
  const nextRefreshToken = result.session?.refreshToken;

  if (!nextAccessToken) {
    await clearStoredSession();
    throw new Error('Refresh response did not include an access token');
  }

  const storageItems = [['authToken', nextAccessToken]];
  if (nextRefreshToken) storageItems.push(['refreshToken', nextRefreshToken]);

  await AsyncStorage.multiSet(storageItems);

  return nextAccessToken;
}

export async function getAuthToken() {
  return AsyncStorage.getItem('authToken');
}

export async function authenticatedFetch(input, init = {}) {
  const makeRequest = async (token) => {
    const headers = {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(input, {
      ...init,
      headers,
    });
  };

  const token = await getAuthToken();
  let response = await makeRequest(token);

  if (response.status !== 401) {
    return response;
  }

  const nextToken = await refreshStoredSession();
  response = await makeRequest(nextToken);

  return response;
}
