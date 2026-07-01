import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient.js";

// Isolated client per call so signInWithPassword/signUp never overwrite the
// shared service-role client's session (which would break RLS bypass on DB queries).
const createAuthClient = () =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );

const ACCOUNT_TYPES = {
  CITIZEN: "citizen",
  ORGANIZATION_MEMBER: "organization_member",
};

const normalizeAccountType = (accountType = ACCOUNT_TYPES.CITIZEN) => {
  if (["organization_member", "org_member", "authority"].includes(accountType)) {
    return ACCOUNT_TYPES.ORGANIZATION_MEMBER;
  }

  return ACCOUNT_TYPES.CITIZEN;
};

const profileConfigByAccountType = {
  [ACCOUNT_TYPES.CITIZEN]: {
    table: "users",
    select: "id, name, phone, email, avatar_url, trust_score, is_verified, created_at",
    missingMessage: "This account is not registered as a citizen user",
  },
  [ACCOUNT_TYPES.ORGANIZATION_MEMBER]: {
    table: "organization_members",
    select:
      "id, name, phone, email, role, organization_id, is_verified, created_at, organization:organizations(id, name, type)",
    missingMessage: "This account is not registered as an organization member",
  },
};

const getProfileForAccountType = async (userId, accountType) => {
  const config = profileConfigByAccountType[accountType];

  const { data, error } = await supabase
    .from(config.table)
    .select(config.select)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load user profile");
  }

  if (!data) {
    throw new Error(config.missingMessage);
  }

  return data;
};

const resolveOrganizationId = (organizationId) => {
  const resolvedOrganizationId =
    organizationId || process.env.DEFAULT_ORGANIZATION_ID;

  if (!resolvedOrganizationId) {
    throw new Error(
      "organization_id is required for organization member accounts"
    );
  }

  return resolvedOrganizationId;
};

export const updateCitizenProfile = async (userId, { name, avatarUrl }) => {
  const updates = {};
  const authMetadata = {};

  if (typeof name === "string") {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Username is required");
    }
    updates.name = trimmedName;
    authMetadata.name = trimmedName;
  }

  if (typeof avatarUrl === "string") {
    updates.avatar_url = avatarUrl.trim() || null;
    authMetadata.avatar_url = updates.avatar_url;
  }

  if (!Object.keys(updates).length) {
    throw new Error("No profile changes provided");
  }

  const { error: profileError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message || "Unable to update profile");
  }

  if (Object.keys(authMetadata).length) {
    const { error: authError } = await createAuthClient().auth.admin.updateUserById(
      userId,
      { user_metadata: authMetadata }
    );

    if (authError) {
      throw new Error(authError.message || "Unable to update auth profile");
    }
  }

  const profile = await getProfileForAccountType(userId, ACCOUNT_TYPES.CITIZEN);

  return {
    ...profile,
    accountType: ACCOUNT_TYPES.CITIZEN,
  };
};

export const updateAuthenticatedPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password should be at least 6 characters long");
  }

  const { error } = await createAuthClient().auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || "Unable to update password");
  }
};

export const deleteCitizenAccount = async (userId) => {
  const { error: profileError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message || "Unable to delete user profile");
  }

  const { error: authError } = await createAuthClient().auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(authError.message || "Unable to delete auth account");
  }
};

export const signIn = async (
  email,
  password,
  accountType = ACCOUNT_TYPES.CITIZEN
) => {
  const normalizedAccountType = normalizeAccountType(accountType);

  console.log("[AuthService] signIn request", {
    email,
    accountType: normalizedAccountType,
  });

  const { data, error } = await createAuthClient().auth.signInWithPassword({
    email,
    password,
  });

  console.log("[AuthService] signIn response", {
    data: { user: data?.user },
    error,
  });

  if (error || !data.session) {
    console.error("[AuthService] signIn failed", { error, data });
    throw new Error(error?.message || "Invalid login credentials");
  }

  const profile = await getProfileForAccountType(
    data.user.id,
    normalizedAccountType
  );

  if (normalizedAccountType === ACCOUNT_TYPES.ORGANIZATION_MEMBER && !profile.is_verified) {
    const notVerifiedError = new Error("NOT_VERIFIED");
    notVerifiedError.memberId = profile.id;
    throw notVerifiedError;
  }

  return {
    user: {
      ...data.user,
      accountType: normalizedAccountType,
      profile,
    },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
  };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const { data, error } = await createAuthClient().auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new Error(error?.message || "Unable to refresh session");
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
  };
};

export const signUp = async ({
  name,
  email,
  phone,
  password,
  accountType = ACCOUNT_TYPES.CITIZEN,
  organization_id,
  role,
  redirectTo,
}) => {
  const normalizedAccountType = normalizeAccountType(accountType);
  const organizationId =
    normalizedAccountType === ACCOUNT_TYPES.ORGANIZATION_MEMBER
      ? resolveOrganizationId(organization_id)
      : null;

  console.log("[AuthService] signUp request", {
    name,
    email,
    phone,
    accountType: normalizedAccountType,
    organization_id: organizationId,
    redirectTo,
  });

  const signUpOptions = {
    data: {
      name,
      phone,
      account_type: normalizedAccountType,
      ...(organizationId ? { organization_id: organizationId } : {}),
      ...(role ? { role } : {}),
    },
  };
  signUpOptions.emailRedirectTo = redirectTo;

  const { data, error } = await createAuthClient().auth.signUp({
    email,
    password,
    options: signUpOptions,
  });

  console.log("[AuthService] signUp response", {
    data: { user: data?.user, session: data?.session },
    error,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Unable to create user");
  }

  const profileTable =
    normalizedAccountType === ACCOUNT_TYPES.ORGANIZATION_MEMBER
      ? "organization_members"
      : "users";

  const profilePayload =
    normalizedAccountType === ACCOUNT_TYPES.ORGANIZATION_MEMBER
      ? {
          name,
          phone,
          email,
          organization_id: organizationId,
          ...(role ? { role } : {}),
        }
      : {
          name,
          phone,
          email,
        };

  // Keep the profile in sync even when the DB trigger already created it.
  const { error: profileUpdateError } = await supabase
    .from(profileTable)
    .update(profilePayload)
    .eq("id", data.user.id);

  if (profileUpdateError) {
    throw new Error(profileUpdateError.message || "Unable to update profile");
  }

  const profile = await getProfileForAccountType(
    data.user.id,
    normalizedAccountType
  );

  return {
    user: {
      ...data.user,
      accountType: normalizedAccountType,
      profile,
    },
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        }
      : null,
  };
};

export const verifyToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new Error("Invalid token");
    }

    return data.user;
  } catch (err) {
    throw err;
  }
};
