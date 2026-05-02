import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api, clearAuthToken, getAuthToken, setAuthToken } from '../services/api'

const USER_STORAGE_KEY = 'authority-jira.auth-user'

function readStoredUser() {
  const raw = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function writeStoredUser(user) {
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const token = getAuthToken()
    const storedUser = readStoredUser()
    return {
      session: token ? { accessToken: token } : null,
      user: storedUser,
      loading: false,
    }
  })

  const { session, user, loading } = authState

  const updateSession = (newSession) => {
    setAuthState((prev) => ({ ...prev, session: newSession }))
  }

  const updateUser = (newUser) => {
    setAuthState((prev) => ({ ...prev, user: newUser }))
  }

  useEffect(() => {
    // Effect is now empty as initialization happens in useState
  }, [])

  const signInWithPassword = useCallback(async ({ email, password }) => {
    const data = await api.post(
      '/auth/login',
      { email, password },
      { auth: false },
    )

    const nextSession = data?.session || null
    const nextUser = data?.user || null
    const accessToken = nextSession?.accessToken || null

    if (!accessToken || !nextUser) {
      throw new Error('Login response is missing session data')
    }

    setAuthToken(accessToken)
    writeStoredUser(nextUser)
    updateSession(nextSession)
    updateUser(nextUser)
    return data
  }, [])

  const signOut = useCallback(async () => {
    clearAuthToken()
    writeStoredUser(null)
    updateSession(null)
    updateUser(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      signInWithPassword,
      signOut,
    }),
    [session, user, loading, signInWithPassword, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

