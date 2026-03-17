import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const PARTNER_TYPES = new Set(["DRIVER", "CAB", "AUTO"]);
const getPartnerTypeForQuery = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (!PARTNER_TYPES.has(normalized)) return "";
  return normalized;
};

export const fetchDriverEngagementAuditLogs = async ({
  page = 1,
  limit = 10,
  partnerType = "CAB",
  partnerId,
  status,
} = {}) => {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const query = {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
    includePartnerDetails: true,
  };
  const queryPartnerType = getPartnerTypeForQuery(partnerType);
  if (queryPartnerType) query.partnerType = queryPartnerType;
  if (Number.isFinite(Number(partnerId))) query.partnerId = Number(partnerId);
  if (status && status !== "ALL") query.status = status;

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.DE_AUDIT_LOG, query);
};

export const fetchDriverEngagementAuditSummary = async ({ partnerType } = {}) => {
  const query = {};
  const queryPartnerType = getPartnerTypeForQuery(partnerType);
  if (queryPartnerType) query.partnerType = queryPartnerType;

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.DE_AUDIT_LOG_SUMMARY, query);
};

export const fetchDriverEngagementAuditActionView = async ({
  id,
  partnerType = "CAB",
  partnerId,
  limit = 20,
  offset = 0,
} = {}) => {
  const queryPartnerType = getPartnerTypeForQuery(partnerType);
  const query = {
    limit: Number(limit) > 0 ? Number(limit) : 20,
    offset: Number(offset) >= 0 ? Number(offset) : 0,
  };
  if (queryPartnerType) query.partnerType = queryPartnerType;
  if (id !== undefined && id !== null && String(id).trim() !== "") query.id = String(id);
  if (Number.isFinite(Number(partnerId))) query.partnerId = Number(partnerId);

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.DE_AUDIT_LOG, query);
};
