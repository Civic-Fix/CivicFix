import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient.js";
import { analyzeIssue, buildIssueAiUpdatePayload } from "./aiService.js";

const allowedStatuses = [
  "reported",
  "verified",
  "in_progress",
  "review",
  "completed",
  "closed",
  "blocked",
];

const allowedVerificationStatuses = [
  "pending",
  "community_verified",
  "authority_verified",
];

const attachmentBucketName =
  process.env.SUPABASE_ISSUE_ATTACHMENTS_BUCKET || "issue-attachments";

const createUserScopedSupabaseClient = (accessToken) => {
  if (!accessToken) {
    return supabase;
  }

  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(process.env.SUPABASE_URL, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

class IssueServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "IssueServiceError";
    this.statusCode = statusCode;
  }
}

const issueSelect = `
  id,
  title,
  description,
  locality,
  lat,
  lng,
  status,
  verification_status,
  is_anonymous,
  created_by,
  assigned_to,
  organization_id,
  category,
  ai_category_confidence,
  ai_severity,
  ai_summary,
  ai_tags,
  ai_duplicate_of,
  ai_duplicate_score,
  ai_duplicate_candidates,
  ai_analysis,
  ai_analyzed_at,
  created_at,
  updated_at
`;

const parseRequiredNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    throw new IssueServiceError(`${fieldName} is required`);
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new IssueServiceError(`${fieldName} must be a valid number`);
  }

  return parsedValue;
};

const parseOptionalNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new IssueServiceError(`${fieldName} must be a valid number`);
  }

  return parsedValue;
};

const parseOptionalPositiveInteger = (value, defaultValue, fieldName = "Value") => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new IssueServiceError(`${fieldName} must be a positive integer`);
  }

  return parsedValue;
};

const normalizeAttachment = (attachment) => {
  if (!attachment || typeof attachment !== "object") {
    throw new IssueServiceError("Each attachment must be an object");
  }

  const fileUrl =
    typeof attachment.file_url === "string" ? attachment.file_url.trim() : "";
  const fileType =
    typeof attachment.file_type === "string" ? attachment.file_type.trim() : "";

  if (!fileUrl) {
    throw new IssueServiceError("Each attachment must include file_url");
  }

  return {
    file_url: fileUrl,
    file_type: fileType || null,
  };
};

const normalizeUpdateAttachmentPayload = (attachment) => {
  if (!attachment || typeof attachment !== "object") {
    throw new IssueServiceError("Each update attachment must be an object");
  }

  const fileUrl =
    typeof attachment.file_url === "string" ? attachment.file_url.trim() : "";
  const fileName =
    typeof attachment.file_name === "string" ? attachment.file_name.trim() : "";
  const mimeType =
    typeof attachment.mime_type === "string" ? attachment.mime_type.trim() : "";
  const fileDataBase64 =
    typeof attachment.file_data_base64 === "string" ? attachment.file_data_base64.trim() : "";

  if (!fileUrl && !(fileName && mimeType && fileDataBase64)) {
    throw new IssueServiceError(
      "Each update attachment must include either file_url or file_name, mime_type, and file_data_base64"
    );
  }

  return {
    file_url: fileUrl || null,
    file_name: fileName || null,
    mime_type: mimeType || null,
    file_data_base64: fileDataBase64 || null,
  };
};

const normalizeUpdateAttachments = (attachments) => {
  if (attachments === undefined || attachments === null) {
    return [];
  }

  if (!Array.isArray(attachments)) {
    throw new IssueServiceError("update attachments must be an array");
  }

  return attachments.map(normalizeUpdateAttachmentPayload);
};

const normalizeUploadPayload = ({ file_name, mime_type, file_data_base64 }) => {
  const fileName = typeof file_name === "string" ? file_name.trim() : "";
  const mimeType = typeof mime_type === "string" ? mime_type.trim() : "";
  const fileData =
    typeof file_data_base64 === "string" ? file_data_base64.trim() : "";

  if (!fileName) {
    throw new IssueServiceError("file_name is required");
  }

  if (!mimeType) {
    throw new IssueServiceError("mime_type is required");
  }

  if (!fileData) {
    throw new IssueServiceError("file_data_base64 is required");
  }

  const sanitizedBase64 = fileData.includes(",")
    ? fileData.split(",").pop()
    : fileData;

  return {
    fileName,
    mimeType,
    fileDataBase64: sanitizedBase64,
  };
};

const normalizeAttachments = (attachments) => {
  if (attachments === undefined || attachments === null) {
    return [];
  }

  if (!Array.isArray(attachments)) {
    throw new IssueServiceError("attachments must be an array");
  }

  return attachments.map(normalizeAttachment);
};

const validateCreateIssuePayload = ({
  title,
  locality,
  lat,
  lng,
  status,
  verification_status,
  attachments,
}) => {
  if (!title || !title.trim()) {
    throw new IssueServiceError("Title is required");
  }

  if (!locality || !locality.trim()) {
    throw new IssueServiceError("Locality is required");
  }

  if (status && !allowedStatuses.includes(status)) {
    throw new IssueServiceError("Invalid issue status");
  }

  if (
    verification_status &&
    !allowedVerificationStatuses.includes(verification_status)
  ) {
    throw new IssueServiceError("Invalid verification status");
  }

  const parsedLat = parseOptionalNumber(lat, "lat");
  const parsedLng = parseOptionalNumber(lng, "lng");

  if ((parsedLat === null) !== (parsedLng === null)) {
    throw new IssueServiceError("Both lat and lng are required when adding an exact location");
  }

  return {
    title: title.trim(),
    locality: locality.trim(),
    lat: parsedLat,
    lng: parsedLng,
    attachments: normalizeAttachments(attachments),
  };
};

const resolveOrganizationId = (organizationId) => {
  const resolvedOrganizationId =
    organizationId || process.env.DEFAULT_ORGANIZATION_ID;

  if (!resolvedOrganizationId) {
    throw new IssueServiceError(
      "organization_id is required or DEFAULT_ORGANIZATION_ID must be configured",
      500
    );
  }

  return resolvedOrganizationId;
};

const ensureOrganizationExists = async (organizationId) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .single();

  if (error || !data) {
    throw new IssueServiceError("Invalid organization_id");
  }
};

const fetchAttachmentsByIssueIds = async (issueIds) => {
  if (!issueIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("attachments")
    .select("id, issue_id, file_url, file_type, uploaded_by, created_at")
    .in("issue_id", issueIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[IssueService] fetchAttachmentsByIssueIds failed", {
      issueIds,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch attachments",
      500
    );
  }

  const attachmentsMap = new Map();

  for (const issueId of issueIds) {
    attachmentsMap.set(issueId, []);
  }

  for (const attachment of data || []) {
    if (!attachmentsMap.has(attachment.issue_id)) {
      attachmentsMap.set(attachment.issue_id, []);
    }

    attachmentsMap.get(attachment.issue_id).push(attachment);
  }

  return attachmentsMap;
};

const fetchUpdateAttachmentsByUpdateIds = async (updateIds) => {
  if (!updateIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("update_attachments")
    .select("id, update_id, file_url, created_at")
    .in("update_id", updateIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[IssueService] fetchUpdateAttachmentsByUpdateIds failed", {
      updateIds,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch update attachments",
      500
    );
  }

  const attachmentsMap = new Map();
  for (const updateId of updateIds) {
    attachmentsMap.set(updateId, []);
  }

  for (const attachment of data || []) {
    if (!attachmentsMap.has(attachment.update_id)) {
      attachmentsMap.set(attachment.update_id, []);
    }

    attachmentsMap.get(attachment.update_id).push(attachment);
  }

  return attachmentsMap;
};

const fetchVotesByIssueIds = async (issueIds) => {
  if (!issueIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("votes")
    .select("id, issue_id, user_id, vote_type, created_at")
    .in("issue_id", issueIds);

  if (error) {
    console.error("[IssueService] fetchVotesByIssueIds failed", {
      issueIds,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to fetch votes", 500);
  }

  return data || [];
};

const fetchUsersByIds = async (userIds) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (!uniqueUserIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, avatar_url, email, trust_score, is_verified")
    .in("id", uniqueUserIds);

  if (error) {
    console.error("[IssueService] fetchUsersByIds failed", {
      userIds: uniqueUserIds,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to fetch users", 500);
  }

  return new Map((data || []).map((user) => [user.id, user]));
};

const fetchOrganizationMembersByIds = async (memberIds) => {
  const uniqueMemberIds = [...new Set(memberIds.filter(Boolean))];

  if (!uniqueMemberIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("id, name, phone, email, role, organization_id, is_verified")
    .in("id", uniqueMemberIds);

  if (error) {
    console.error("[IssueService] fetchOrganizationMembersByIds failed", {
      memberIds: uniqueMemberIds,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch organization members",
      500
    );
  }

  return new Map((data || []).map((member) => [member.id, member]));
};

const fetchOrganizationsByIds = async (organizationIds) => {
  const uniqueOrganizationIds = [...new Set(organizationIds.filter(Boolean))];

  if (!uniqueOrganizationIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, type")
    .in("id", uniqueOrganizationIds);

  if (error) {
    console.error("[IssueService] fetchOrganizationsByIds failed", {
      organizationIds: uniqueOrganizationIds,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch organizations",
      500
    );
  }

  return new Map(
    (data || []).map((organization) => [organization.id, organization])
  );
};

const attachRelatedData = async (issues, currentUserId = null) => {
  if (!issues.length) {
    return [];
  }

  const issueIds = issues.map((issue) => issue.id);
  const [attachmentsMap, votes, usersMap, membersMap, organizationsMap] =
    await Promise.all([
      fetchAttachmentsByIssueIds(issueIds),
      fetchVotesByIssueIds(issueIds),
      fetchUsersByIds(issues.map((issue) => issue.created_by)),
      fetchOrganizationMembersByIds(issues.map((issue) => issue.assigned_to)),
      fetchOrganizationsByIds(issues.map((issue) => issue.organization_id)),
    ]);

  const voteSummaryMap = new Map();

  for (const issueId of issueIds) {
    voteSummaryMap.set(issueId, {
      upvote_count: 0,
      downvote_count: 0,
      current_user_upvote_id: null,
      current_user_downvote_id: null,
    });
  }

  for (const vote of votes) {
    const s = voteSummaryMap.get(vote.issue_id) || {
      upvote_count: 0,
      downvote_count: 0,
      current_user_upvote_id: null,
      current_user_downvote_id: null,
    };

    if (vote.vote_type === 'upvote') s.upvote_count += 1;
    else s.downvote_count += 1;

    if (currentUserId && vote.user_id === currentUserId) {
      if (vote.vote_type === 'upvote') s.current_user_upvote_id = vote.id;
      else s.current_user_downvote_id = vote.id;
    }

    voteSummaryMap.set(vote.issue_id, s);
  }

  return issues.map((issue) => {
    const s = voteSummaryMap.get(issue.id);
    const isAnonymous = Boolean(issue.is_anonymous);
    const isOwner = Boolean(currentUserId && issue.created_by === currentUserId);
    const shouldHideReporter = isAnonymous && !isOwner;

    return {
      ...issue,
      created_by: shouldHideReporter ? null : issue.created_by,
      created_by_user: shouldHideReporter ? null : usersMap.get(issue.created_by) || null,
      is_owner: isOwner,
      assigned_to_user: membersMap.get(issue.assigned_to) || null,
      organization: organizationsMap.get(issue.organization_id) || null,
      attachments: attachmentsMap.get(issue.id) || [],
      upvote_count: s?.upvote_count || 0,
      downvote_count: s?.downvote_count || 0,
      current_user_upvote_id: s?.current_user_upvote_id || null,
      current_user_downvote_id: s?.current_user_downvote_id || null,
    };
  });
};

const getIssueRecordById = async (issueId) => {
  const { data, error } = await supabase
    .from("issues")
    .select(issueSelect)
    .eq("id", issueId)
    .single();

  if (error?.code === "PGRST116" || !data) {
    throw new IssueServiceError("Issue not found", 404);
  }

  if (error) {
    console.error("[IssueService] getIssueRecordById failed", {
      issueId,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch issue",
      500
    );
  }

  return data;
};

const formatUpdateRecord = (update, issue = null) => {
  const organization = issue?.organization || null;
  const attachments = update.update_attachments || update.attachments || [];

  return {
    ...update,
    content: update.message,
    author_id: update.created_by,
    display_type: update.type === "comment" ? "progress" : update.type,
    organization,
    organization_id: organization?.id || issue?.organization_id || null,
    organization_name: organization?.name || null,
    issue: issue
      ? {
          id: issue.id,
          title: issue.title,
          locality: issue.locality,
          status: issue.status,
          organization_id: issue.organization_id,
          organization,
        }
      : null,
    update_attachments: attachments,
    attachments,
  };
};

const uploadBufferToStorage = async ({
  buffer,
  fileName,
  mimeType,
  userId,
}) => {
  const fileExtension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase()
    : "jpg";
  const objectPath = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${fileExtension}`;

  const { error } = await supabase.storage
    .from(attachmentBucketName)
    .upload(objectPath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[IssueService] uploadBufferToStorage failed", {
      attachmentBucketName,
      objectPath,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to upload attachment",
      500
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(attachmentBucketName)
    .getPublicUrl(objectPath);

  return {
    bucket: attachmentBucketName,
    path: objectPath,
    file_url: publicUrlData?.publicUrl || null,
  };
};

const haversineDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const originLat = toRadians(lat1);
  const targetLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

const applyAiAnalysisToIssue = async (issueId, issuePayload, attachments = []) => {
  try {
    const analysis = await analyzeIssue({
      ...issuePayload,
      id: issueId,
      attachments,
    });
    const updatePayload = buildIssueAiUpdatePayload(analysis);
    const { error } = await supabase
      .from("issues")
      .update(updatePayload)
      .eq("id", issueId);

    if (error) {
      console.error("[IssueService] AI metadata update failed", {
        issueId,
        error,
      });
      return null;
    }

    return analysis;
  } catch (error) {
    console.error("[IssueService] AI analysis failed", {
      issueId,
      message: error?.message,
    });
    return null;
  }
};

const scheduleAiAnalysisForIssue = (issueId, issuePayload, attachments = []) => {
  const runAnalysis = () => {
    applyAiAnalysisToIssue(issueId, issuePayload, attachments).catch((error) => {
      console.error("[IssueService] scheduled AI analysis failed", {
        issueId,
        message: error?.message,
      });
    });
  };

  if (typeof setImmediate === "function") {
    setImmediate(runAnalysis);
    return;
  }

  setTimeout(runAnalysis, 0);
};

export const createIssue = async (issueData, userId) => {
  const {
    title,
    description,
    locality,
    lat,
    lng,
    organization_id,
    assigned_to,
    status,
    verification_status,
    is_anonymous,
    isAnonymous,
    attachments,
  } = issueData;

  const resolvedOrganizationId = resolveOrganizationId(organization_id);

  const validatedFields = validateCreateIssuePayload({
    title,
    locality,
    lat,
    lng,
    status,
    verification_status,
    attachments,
  });

  await ensureOrganizationExists(resolvedOrganizationId);

  const issuePayload = {
    title: validatedFields.title,
    description: description?.trim() || null,
    locality: validatedFields.locality,
    lat: validatedFields.lat,
    lng: validatedFields.lng,
    created_by: userId,
    organization_id: resolvedOrganizationId,
    assigned_to: assigned_to || null,
    status: status || "reported",
    verification_status: verification_status || "pending",
    is_anonymous: Boolean(is_anonymous ?? isAnonymous),
  };

  const { data, error } = await supabase
    .from("issues")
    .insert(issuePayload)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[IssueService] createIssue insert failed", {
      payload: issuePayload,
      error,
    });
    throw new IssueServiceError(
      error?.message || "Unable to create issue",
      500
    );
  }

  if (validatedFields.attachments.length) {
    const attachmentPayload = validatedFields.attachments.map((attachment) => ({
      issue_id: data.id,
      file_url: attachment.file_url,
      file_type: attachment.file_type,
      uploaded_by: userId,
    }));

    const { error: attachmentError } = await supabase
      .from("attachments")
      .insert(attachmentPayload);

    if (attachmentError) {
      await supabase.from("issues").delete().eq("id", data.id);

      console.error("[IssueService] createIssue attachment insert failed", {
        issueId: data.id,
        attachmentPayload,
        error: attachmentError,
      });
      throw new IssueServiceError(
        attachmentError.message || "Issue created but attachments could not be saved",
        500
      );
    }
  }

  scheduleAiAnalysisForIssue(data.id, issuePayload, validatedFields.attachments);

  return getIssueById(data.id, userId);
};

export const getIssues = async (query = {}, currentUserId = null) => {
  const page = parseOptionalPositiveInteger(query.page, 1, "page");
  const limit = parseOptionalPositiveInteger(query.limit, 20, "limit");
  const offset = (page - 1) * limit;

  const { count: rawCount } = await supabase
    .from("issues")
    .select("id", { count: "exact", head: true });
  console.log("[IssueService] raw issues count (no joins):", rawCount);

  let issuesQuery = supabase
    .from("issues")
    .select(issueSelect, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query.status) {
    issuesQuery = issuesQuery.eq("status", query.status);
  }

  if (query.verification_status) {
    issuesQuery = issuesQuery.eq(
      "verification_status",
      query.verification_status
    );
  }

  if (query.organization_id) {
    issuesQuery = issuesQuery.eq("organization_id", query.organization_id);
  }

  if (query.locality) {
    issuesQuery = issuesQuery.ilike("locality", `%${query.locality}%`);
  }

  if (query.created_by) {
    issuesQuery = issuesQuery.eq("created_by", query.created_by);
  }

  if (query.assigned_to) {
    issuesQuery = issuesQuery.eq("assigned_to", query.assigned_to);
  }

  const { data, error, count } = await issuesQuery;

  if (error) {
    console.error("[IssueService] getIssues failed", {
      query,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to fetch issues", 500);
  }

  const issues = await attachRelatedData(data || [], currentUserId);

  return {
    issues,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: count ? Math.ceil(count / limit) : 0,
    },
  };
};

export const searchIssues = async (searchTerm, currentUserId = null) => {
  const normalizedTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";

  if (!normalizedTerm) {
    return [];
  }

  const { data, error } = await supabase.rpc("search_issues", {
    search_term: normalizedTerm,
  });

  if (error) {
    console.error("[IssueService] searchIssues failed", {
      searchTerm: normalizedTerm,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to search issues", 500);
  }

  const issueIds = Array.isArray(data) ? data.map((issue) => issue.id).filter(Boolean) : [];

  if (!issueIds.length) {
    return [];
  }

  const { data: fullIssues, error: fullIssueError } = await supabase
    .from("issues")
    .select(issueSelect)
    .in("id", issueIds);

  if (fullIssueError) {
    console.error("[IssueService] searchIssues full issue fetch failed", {
      issueIds,
      error: fullIssueError,
    });
    throw new IssueServiceError(fullIssueError.message || "Unable to search issues", 500);
  }

  const issueById = new Map((fullIssues || []).map((issue) => [issue.id, issue]));
  const orderedIssues = issueIds.map((id) => issueById.get(id)).filter(Boolean);

  return attachRelatedData(orderedIssues, currentUserId);
};

export const getIssueById = async (issueId, currentUserId = null) => {
  const issue = await getIssueRecordById(issueId);
  const [enrichedIssue] = await attachRelatedData([issue], currentUserId);
  return enrichedIssue;
};

export const updateIssue = async (issueId, patch = {}, userId = null, accessToken = null) => {
  console.log("[IssueService] updateIssue called", { issueId, userId, patchKeys: Object.keys(patch), patch });
  const existingIssue = await getIssueRecordById(issueId);
  console.log("[IssueService] existingIssue", { id: existingIssue.id, status: existingIssue.status });
  const supabaseClient = createUserScopedSupabaseClient(accessToken);

  const updatePayload = {};

  if (patch.status !== undefined) {
    console.log("[IssueService] status update requested", { from: existingIssue.status, to: patch.status });
    if (!allowedStatuses.includes(patch.status)) {
      throw new IssueServiceError("Invalid issue status");
    }
    updatePayload.status = patch.status;

    if (patch.status === "verified" && patch.verification_status === undefined) {
      updatePayload.verification_status = "authority_verified";
    }
  }

  if (patch.verification_status !== undefined) {
    if (!allowedVerificationStatuses.includes(patch.verification_status)) {
      throw new IssueServiceError("Invalid verification status");
    }
    updatePayload.verification_status = patch.verification_status;
  }

  if (patch.assigned_to !== undefined) {
    updatePayload.assigned_to = patch.assigned_to || null;
  }

  console.log("[IssueService] updatePayload prepared", { updatePayload });
  
  if (!Object.keys(updatePayload).length) {
    throw new IssueServiceError("No supported fields provided for update");
  }

  const adminOnlyStatuses = ["completed", "blocked", "closed"];
  if (updatePayload.status && adminOnlyStatuses.includes(updatePayload.status) && userId) {
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (memberError || !member) {
      throw new IssueServiceError("Unable to verify member role", 500);
    }

    if (member.role !== "admin") {
      throw new IssueServiceError(
        `Only admins can move issues to '${updatePayload.status}' status`,
        403
      );
    }
  }

  const hasStatusChange = updatePayload.status !== undefined;

  if (hasStatusChange) {
    const { error: rpcError } = await supabase.rpc("update_issue_status_by_authority", {
      p_issue_id: issueId,
      p_status: updatePayload.status,
      p_changed_by: userId,
      p_verification_status: updatePayload.verification_status ?? null,
    });

    if (rpcError) {
      console.error("[IssueService] updateIssue rpc failed", { issueId, userId, updatePayload, error: rpcError });
      throw new IssueServiceError(rpcError.message || "Unable to update issue", 500);
    }
  }

  const nonStatusPayload = {};
  if (!hasStatusChange && updatePayload.verification_status !== undefined) nonStatusPayload.verification_status = updatePayload.verification_status;
  if (updatePayload.assigned_to !== undefined) nonStatusPayload.assigned_to = updatePayload.assigned_to;

  if (Object.keys(nonStatusPayload).length) {
    const { error: patchError } = await supabase.from("issues").update(nonStatusPayload).eq("id", issueId);
    if (patchError) {
      console.error("[IssueService] non-status patch failed", { issueId, nonStatusPayload, error: patchError });
      throw new IssueServiceError(patchError.message || "Unable to update issue", 500);
    }
  }

  console.log("[IssueService] fetching updated issue");
  const updated = await getIssueById(issueId, userId);
  console.log("[IssueService] returning updated issue", { id: updated.id, status: updated.status });
  return updated;
};

export const listIssueUpdates = async (issueId) => {
  const issue = await getIssueRecordById(issueId);

  const { data, error } = await supabase
    .from("updates")
    .select("id, issue_id, message, type, created_by, created_at")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[IssueService] listIssueUpdates failed", {
      issueId,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to fetch issue updates", 500);
  }

  const updateRows = data || [];
  const updateIds = updateRows.map((update) => update.id).filter(Boolean);
  const attachmentsMap = await fetchUpdateAttachmentsByUpdateIds(updateIds);

  const updatesWithAttachments = updateRows.map((update) => ({
    ...update,
    update_attachments: attachmentsMap.get(update.id) || [],
  }));

  const organizationsMap = await fetchOrganizationsByIds([issue.organization_id]);
  const organization = organizationsMap.get(issue.organization_id) || null;
  const issueSummary = {
    id: issue.id,
    title: issue.title,
    locality: issue.locality,
    status: issue.status,
    organization_id: issue.organization_id,
    organization,
  };

  return updatesWithAttachments.map((update) => formatUpdateRecord(update, issueSummary));
};

export const listAllUpdates = async () => {
  const { data, error } = await supabase
    .from("updates")
    .select("id, issue_id, message, type, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[IssueService] listAllUpdates failed", {
      error,
    });
    throw new IssueServiceError(error.message || "Unable to fetch issue updates", 500);
  }

  const updateRows = data || [];
  const updateIds = updateRows.map((update) => update.id).filter(Boolean);
  const updateAttachmentsMap = await fetchUpdateAttachmentsByUpdateIds(updateIds);
  const updates = updateRows.map((update) => ({
    ...update,
    update_attachments: updateAttachmentsMap.get(update.id) || [],
  }));

  const issueIds = [...new Set(updates.map((update) => update.issue_id).filter(Boolean))];

  if (issueIds.length === 0) {
    return updates.map((update) => formatUpdateRecord(update));
  }

  const { data: issues, error: issueError } = await supabase
    .from("issues")
    .select("id, title, locality, status, organization_id")
    .in("id", issueIds);

  if (issueError) {
    console.error("[IssueService] listAllUpdates issue lookup failed", {
      issueError,
    });
    throw new IssueServiceError(issueError.message || "Unable to fetch issue metadata", 500);
  }

  const organizationsMap = await fetchOrganizationsByIds(
    (issues || []).map((issue) => issue.organization_id)
  );

  const issueMap = (issues || []).reduce((acc, issue) => {
    acc[issue.id] = {
      ...issue,
      organization: organizationsMap.get(issue.organization_id) || null,
    };
    return acc;
  }, {});

  return updates.map((update) => ({
    ...formatUpdateRecord(update, issueMap[update.issue_id] || null),
  }));
};

export const addIssueUpdate = async (issueId, content, userId, attachments = []) => {
  const issue = await getIssueRecordById(issueId);

  const normalizedContent = typeof content === "string" ? content.trim() : "";

  if (!normalizedContent) {
    throw new IssueServiceError("content is required");
  }

  const { data, error } = await supabase
    .from("updates")
    .insert({
      issue_id: issueId,
      message: normalizedContent,
      created_by: userId,
      type: "comment",
    })
    .select("id, issue_id, message, type, created_by, created_at")
    .single();

  if (error || !data) {
    console.error("[IssueService] addIssueUpdate failed", {
      issueId,
      userId,
      error,
    });
    throw new IssueServiceError(error?.message || "Unable to add issue update", 500);
  }

  if (attachments.length) {
    const normalizedAttachments = normalizeUpdateAttachments(attachments);
    const attachmentRows = [];

    for (const attachment of normalizedAttachments) {
      let fileUrl = attachment.file_url;

      if (!fileUrl) {
        const uploadResult = await uploadBufferToStorage({
          buffer: Buffer.from(attachment.file_data_base64, "base64"),
          fileName: attachment.file_name,
          mimeType: attachment.mime_type,
          userId,
        });

        if (!uploadResult.file_url) {
          await supabase.from("updates").delete().eq("id", data.id);
          throw new IssueServiceError(
            "Attachment uploaded but no public URL could be generated",
            500
          );
        }

        fileUrl = uploadResult.file_url;
      }

      attachmentRows.push({
        update_id: data.id,
        file_url: fileUrl,
      });
    }

    const { data: attachedRows, error: attachmentError } = await supabase
      .from("update_attachments")
      .insert(attachmentRows)
      .select("id, update_id, file_url, created_at");

    if (attachmentError) {
      await supabase.from("updates").delete().eq("id", data.id);
      console.error("[IssueService] addIssueUpdate attachments failed", {
        issueId,
        userId,
        attachmentRows,
        error: attachmentError,
      });
      throw new IssueServiceError(
        attachmentError.message || "Update created but attachments could not be saved",
        500
      );
    }

    data.update_attachments = attachedRows || [];
  } else {
    data.update_attachments = [];
  }

  const organizationsMap = await fetchOrganizationsByIds([issue.organization_id]);
  const issueSummary = {
    id: issue.id,
    title: issue.title,
    locality: issue.locality,
    status: issue.status,
    organization_id: issue.organization_id,
    organization: organizationsMap.get(issue.organization_id) || null,
  };

  return formatUpdateRecord(data, issueSummary);
};

export const addIssueVote = async (issueId, userId, voteType = "upvote") => {
  if (!["upvote", "downvote"].includes(voteType)) {
    throw new IssueServiceError("vote_type must be 'upvote' or 'downvote'", 400);
  }

  await getIssueRecordById(issueId);

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("votes")
    .select("id")
    .eq("issue_id", issueId)
    .eq("user_id", userId)
    .eq("vote_type", voteType)
    .maybeSingle();

  if (existingVoteError) {
    console.error("[IssueService] addIssueVote check failed", {
      issueId, userId, error: existingVoteError,
    });
    throw new IssueServiceError(existingVoteError.message || "Unable to create vote", 500);
  }

  if (existingVote) {
    throw new IssueServiceError("You have already cast this vote", 409);
  }

  const { data, error } = await supabase
    .from("votes")
    .insert({ issue_id: issueId, user_id: userId, vote_type: voteType })
    .select()
    .single();

  if (error || !data) {
    console.error("[IssueService] addIssueVote insert failed", {
      issueId, userId, error,
    });
    throw new IssueServiceError(error?.message || "Unable to create vote", 500);
  }

  return {
    vote: data,
    issue: await getIssueById(issueId, userId),
  };
};

export const removeIssueVote = async (issueId, userId, voteType = "upvote") => {
  await getIssueRecordById(issueId);

  const { data, error } = await supabase
    .from("votes")
    .delete()
    .eq("issue_id", issueId)
    .eq("user_id", userId)
    .eq("vote_type", voteType)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[IssueService] removeIssueVote failed", {
      issueId,
      userId,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to remove vote", 500);
  }

  if (!data) {
    throw new IssueServiceError("Vote not found for this user", 404);
  }

  return {
    removed_vote_id: data.id,
    issue: await getIssueById(issueId, userId),
  };
};

export const addIssueAttachment = async (issueId, attachmentData, userId) => {
  await getIssueRecordById(issueId);

  const normalizedAttachment = normalizeAttachment(attachmentData);

  const { data, error } = await supabase
    .from("attachments")
    .insert({
      issue_id: issueId,
      file_url: normalizedAttachment.file_url,
      file_type: normalizedAttachment.file_type,
      uploaded_by: userId,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[IssueService] addIssueAttachment failed", {
      issueId,
      userId,
      attachmentData,
      error,
    });
    throw new IssueServiceError(
      error?.message || "Unable to add attachment",
      500
    );
  }

  return {
    attachment: data,
    issue: await getIssueById(issueId, userId),
  };
};

export const uploadIssueAttachmentAsset = async (uploadData, userId) => {
  const { fileName, mimeType, fileDataBase64 } = normalizeUploadPayload(uploadData);

  let fileBuffer;

  try {
    fileBuffer = Buffer.from(fileDataBase64, "base64");
  } catch (error) {
    throw new IssueServiceError("Invalid base64 attachment payload");
  }

  if (!fileBuffer?.length) {
    throw new IssueServiceError("Attachment payload is empty");
  }

  const uploadResult = await uploadBufferToStorage({
    buffer: fileBuffer,
    fileName,
    mimeType,
    userId,
  });

  if (!uploadResult.file_url) {
    throw new IssueServiceError(
      "Attachment uploaded but no public URL could be generated",
      500
    );
  }

  return {
    file_url: uploadResult.file_url,
    file_type: mimeType,
    bucket: uploadResult.bucket,
    path: uploadResult.path,
  };
};

export const deleteIssue = async (issueId, userId) => {
  const issue = await getIssueRecordById(issueId);

  if (issue.created_by !== userId) {
    throw new IssueServiceError("You can only delete your own issues", 403);
  }

  const attachmentsMap = await fetchAttachmentsByIssueIds([issueId]);
  const attachments = attachmentsMap.get(issueId) || [];
  const storagePaths = attachments
    .map((attachment) => {
      const marker = `/${attachmentBucketName}/`;

      if (!attachment.file_url?.includes(marker)) {
        return null;
      }

      return attachment.file_url.split(marker)[1] || null;
    })
    .filter(Boolean);

  const cleanupOperations = [
    supabase.from("attachments").delete().eq("issue_id", issueId),
    supabase.from("votes").delete().eq("issue_id", issueId),
    supabase.from("updates").delete().eq("issue_id", issueId),
    supabase.from("proofs").delete().eq("issue_id", issueId),
    supabase.from("issue_verifications").delete().eq("issue_id", issueId),
    supabase.from("issue_status_logs").delete().eq("issue_id", issueId),
  ];

  const cleanupResults = await Promise.all(cleanupOperations);
  const cleanupError = cleanupResults.find((result) => result.error)?.error;

  if (cleanupError) {
    console.error("[IssueService] deleteIssue relation cleanup failed", {
      issueId,
      userId,
      error: cleanupError,
    });
    throw new IssueServiceError(
      cleanupError.message || "Unable to delete issue relations",
      500
    );
  }

  const { error } = await supabase.from("issues").delete().eq("id", issueId);

  if (error) {
    console.error("[IssueService] deleteIssue failed", {
      issueId,
      userId,
      error,
    });
    throw new IssueServiceError(error.message || "Unable to delete issue", 500);
  }

  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage
      .from(attachmentBucketName)
      .remove(storagePaths);

    if (storageError) {
      console.warn("[IssueService] deleteIssue storage cleanup failed", {
        issueId,
        storagePaths,
        error: storageError,
      });
    }
  }

  return {
    deleted_issue_id: issueId,
  };
};

export const getNearbyIssues = async ({ lat, lng, radius, limit }, currentUserId = null) => {
  const queryLat = parseRequiredNumber(lat, "lat");
  const queryLng = parseRequiredNumber(lng, "lng");
  const radiusMeters = parseOptionalPositiveInteger(radius, 5000, "radius");
  const resultLimit = parseOptionalPositiveInteger(limit, 50, "limit");

  const { data, error } = await supabase
    .from("issues")
    .select(issueSelect)
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(500);

  if (error) {
    console.error("[IssueService] getNearbyIssues failed", {
      queryLat,
      queryLng,
      radiusMeters,
      resultLimit,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch nearby issues",
      500
    );
  }

  const nearbyIssues = (data || [])
    .map((issue) => ({
      ...issue,
      distance_meters: haversineDistanceMeters(
        queryLat,
        queryLng,
        issue.lat,
        issue.lng
      ),
    }))
    .filter((issue) => issue.distance_meters <= radiusMeters)
    .sort((left, right) => {
      if (left.distance_meters !== right.distance_meters) {
        return left.distance_meters - right.distance_meters;
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    })
    .slice(0, resultLimit);

  return attachRelatedData(nearbyIssues, currentUserId);
};

export const getIssueMapPoints = async (limit) => {
  const resultLimit = parseOptionalPositiveInteger(limit, 250, "limit");

  const { data, error } = await supabase
    .from("issues")
    .select("id, title, status, verification_status, lat, lng, created_at")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("created_at", { ascending: false })
    .limit(resultLimit);

  if (error) {
    console.error("[IssueService] getIssueMapPoints failed", {
      resultLimit,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to fetch issue map points",
      500
    );
  }

  return data || [];
};

export { IssueServiceError };
