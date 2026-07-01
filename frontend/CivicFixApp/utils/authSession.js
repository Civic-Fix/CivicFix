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

  let response;
  let result = {};

  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    result = await readJsonSafely(response);
  } catch (err) {
    throw new Error(err.message || 'Unable to refresh session');
  }

  if (!response.ok) {
    const shouldClearRefresh =
      response.status === 401 ||
      /invalid refresh token|refresh token.*invalid|refresh token.*expired|token expired|invalid token/i.test(
        result.error || ''
      );

    if (shouldClearRefresh) {
      await clearStoredSession();
    }

    throw new Error(result.error || 'Unable to refresh session');
  }

  const nextAccessToken = result.session?.accessToken || result.session?.access_token;
  const nextRefreshToken = result.session?.refreshToken || result.session?.refresh_token;

  if (!nextAccessToken) {
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

export async function getRefreshToken() {
  return AsyncStorage.getItem('refreshToken');
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

  let token = await getAuthToken();

  if (!token) {
    token = await refreshStoredSession();
  }

  let response = await makeRequest(token);

  if (response.status !== 401) {
    return response;
  }

  const nextToken = await refreshStoredSession();
  response = await makeRequest(nextToken);

  return response;
}
