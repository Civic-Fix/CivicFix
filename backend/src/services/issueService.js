import { supabase } from "../config/supabaseClient.js";

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

class IssueServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "IssueServiceError";
    this.statusCode = statusCode;
  }
}

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

const validateCreateIssuePayload = ({
  title,
  lat,
  lng,
  organization_id,
  status,
  verification_status,
}) => {
  if (!title || !title.trim()) {
    throw new IssueServiceError("Title is required");
  }

  if (!organization_id) {
    throw new IssueServiceError("organization_id is required");
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

  return {
    title: title.trim(),
    lat: parseRequiredNumber(lat, "lat"),
    lng: parseRequiredNumber(lng, "lng"),
  };
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

export const createIssue = async (issueData, userId) => {
  const {
    title,
    description,
    category,
    lat,
    lng,
    organization_id,
    assigned_to,
    status,
    verification_status,
  } = issueData;

  const validatedFields = validateCreateIssuePayload({
    title,
    lat,
    lng,
    organization_id,
    status,
    verification_status,
  });

  await ensureOrganizationExists(organization_id);

  const issuePayload = {
    title: validatedFields.title,
    description: description?.trim() || null,
    category: category?.trim() || null,
    lat: validatedFields.lat,
    lng: validatedFields.lng,
    created_by: userId,
    organization_id,
    assigned_to: assigned_to || null,
    status: status || "reported",
    verification_status: verification_status || "pending",
  };

  const { data, error } = await supabase
    .from("issues")
    .insert(issuePayload)
    .select()
    .single();

  if (error) {
    console.error("[IssueService] createIssue insert failed", {
      payload: issuePayload,
      error,
    });
    throw new IssueServiceError(
      error.message || "Unable to create issue",
      500
    );
  }

  return data;
};

export { IssueServiceError };
