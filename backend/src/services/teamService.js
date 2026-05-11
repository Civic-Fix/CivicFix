import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient.js";

const createAuthAdminClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export class TeamServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "TeamServiceError";
    this.statusCode = statusCode;
  }
}

const ALLOWED_ROLES = ["admin", "officer", "contractor"];

const getMemberWithOrg = async (userId) => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, role, organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) throw new TeamServiceError("Member not found", 404);
  return data;
};

export const getTeamMembers = async (userId) => {
  const requester = await getMemberWithOrg(userId);

  const { data, error } = await supabase
    .from("organization_members")
    .select("id, name, email, phone, role, dept, is_verified, created_at")
    .eq("organization_id", requester.organization_id)
    .order("created_at", { ascending: true });

  if (error) throw new TeamServiceError(error.message || "Unable to fetch team", 500);
  return data || [];
};

export const addTeamMember = async ({ name, email, password, role, dept }, requestingUserId) => {
  const requester = await getMemberWithOrg(requestingUserId);

  if (requester.role !== "admin") {
    throw new TeamServiceError("Only admins can add team members", 403);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new TeamServiceError(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  }

  if (!name?.trim()) throw new TeamServiceError("Name is required");
  if (!email?.trim()) throw new TeamServiceError("Email is required");
  if (!password || password.length < 6) throw new TeamServiceError("Password must be at least 6 characters");

  if (role === "admin") {
    const { count } = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", requester.organization_id)
      .eq("role", "admin");

    if (count > 0) {
      throw new TeamServiceError("There can only be one admin per organization", 409);
    }
  }

  const { data: authData, error: authError } = await createAuthAdminClient().auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: {
      name: name.trim(),
      account_type: "organization_member",
      organization_id: requester.organization_id,
      role,
    },
  });

  if (authError || !authData.user) {
    throw new TeamServiceError(authError?.message || "Unable to create user", 500);
  }

  if (dept) {
    await supabase
      .from("organization_members")
      .update({ dept: dept.trim() })
      .eq("id", authData.user.id);
  }

  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("id, name, email, phone, role, dept, is_verified, created_at")
    .eq("id", authData.user.id)
    .single();

  if (memberError || !member) {
    throw new TeamServiceError("Member created but profile not found", 500);
  }

  return member;
};

export const requestAccess = async (memberId) => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, is_verified")
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data) throw new TeamServiceError("Member not found", 404);
  if (data.is_verified) throw new TeamServiceError("Member is already verified", 400);

  const { error: updateError } = await supabase
    .from("organization_members")
    .update({ access_requested: true })
    .eq("id", memberId);

  if (updateError) throw new TeamServiceError(updateError.message || "Unable to send request", 500);
};

export const approveMember = async (memberId, requestingUserId) => {
  const requester = await getMemberWithOrg(requestingUserId);
  if (requester.role !== "admin") throw new TeamServiceError("Only admins can approve members", 403);

  const { data: target, error: targetError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("id", memberId)
    .maybeSingle();

  if (targetError || !target) throw new TeamServiceError("Member not found", 404);
  if (target.organization_id !== requester.organization_id)
    throw new TeamServiceError("Cannot approve members from a different organization", 403);

  const { error } = await supabase
    .from("organization_members")
    .update({ is_verified: true, access_requested: false })
    .eq("id", memberId);

  if (error) throw new TeamServiceError(error.message || "Unable to approve member", 500);
};

export const removeTeamMember = async (memberId, requestingUserId) => {
  const requester = await getMemberWithOrg(requestingUserId);

  if (requester.role !== "admin") {
    throw new TeamServiceError("Only admins can remove team members", 403);
  }

  if (memberId === requestingUserId) {
    throw new TeamServiceError("You cannot remove yourself", 400);
  }

  const { data: target, error: targetError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("id", memberId)
    .maybeSingle();

  if (targetError || !target) throw new TeamServiceError("Member not found", 404);

  if (target.organization_id !== requester.organization_id) {
    throw new TeamServiceError("Cannot remove members from a different organization", 403);
  }

  const { error } = await createAuthAdminClient().auth.admin.deleteUser(memberId);
  if (error) throw new TeamServiceError(error.message || "Unable to remove member", 500);

  return { removed_id: memberId };
};
