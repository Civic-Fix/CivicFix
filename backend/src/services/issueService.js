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

const parseOptionalPositiveInteger = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new IssueServiceError("Value must be a positive integer");
  }

  return parsedValue;
};

const validateImages = (images) => {
  if (!Array.isArray(images) || images.length < 1) {
    throw new IssueServiceError("At least one image is required");
  }

  const normalizedImages = images
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .filter(Boolean);

  if (!normalizedImages.length) {
    throw new IssueServiceError("At least one image is required");
  }

  return normalizedImages;
};

const validateCreateIssuePayload = ({
  title,
  lat,
  lng,
  status,
  verification_status,
  images,
}) => {
  if (!title || !title.trim()) {
    throw new IssueServiceError("Title is required");
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
    images: validateImages(images),
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
    address,
    images,
  } = issueData;

  const resolvedOrganizationId = resolveOrganizationId(organization_id);

  const validatedFields = validateCreateIssuePayload({
    title,
    lat,
    lng,
    status,
    verification_status,
    images,
  });

  await ensureOrganizationExists(resolvedOrganizationId);

  const issuePayload = {
    title: validatedFields.title,
    description: description?.trim() || null,
    category: category?.trim() || null,
    lat: validatedFields.lat,
    lng: validatedFields.lng,
    address: address?.trim() || null,
    image_urls: validatedFields.images,
    created_by: userId,
    organization_id: resolvedOrganizationId,
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

export const getNearbyIssues = async ({
  lat,
  lng,
  radius,
  limit,
}) => {
  const queryLat = parseRequiredNumber(lat, "lat");
  const queryLng = parseRequiredNumber(lng, "lng");
  const radiusMeters = parseOptionalPositiveInteger(radius, 5000);
  const resultLimit = parseOptionalPositiveInteger(limit, 50);

  const { data, error } = await supabase.rpc("get_nearby_issues", {
    query_lat: queryLat,
    query_lng: queryLng,
    radius_meters: radiusMeters,
    result_limit: resultLimit,
  });

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

  return data || [];
};

export const getIssueMapPoints = async (limit) => {
  const resultLimit = parseOptionalPositiveInteger(limit, 250);

  const { data, error } = await supabase
    .from("issues")
    .select(
      "id, title, status, verification_status, lat, lng, address, created_at"
    )
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
