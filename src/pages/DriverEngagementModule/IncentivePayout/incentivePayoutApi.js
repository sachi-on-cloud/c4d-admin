import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const PARTNER_TYPES = new Set(["DRIVER", "CAB", "AUTO"]);
const getPartnerTypeForQuery = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (!PARTNER_TYPES.has(normalized)) return "";
  return normalized;
};

export const fetchIncentivePayoutData = async ({
  page = 1,
  limit,
  status = "ALL",
} = {}) => {
  const query = { page };
  if (limit) query.limit = limit;
  if (status && status !== "ALL") query.status = status;

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.INCENTIVE_PAYOUT, query);
};

export const fetchIncentivePayoutSummary = async ({ partnerType } = {}) => {
  const query = {};
  const queryPartnerType = getPartnerTypeForQuery(partnerType);
  if (queryPartnerType) query.partnerType = queryPartnerType;

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.INCENTIVE_PAYOUT_SUMMARY, query);
};

export const fetchIncentivePayoutActionView = async ({
  id,
  partnerType,
  status,
  partnerId,
  requestId,
  limit = 20,
  offset = 0,
} = {}) => {
  const query = {
    limit: Number(limit) > 0 ? Number(limit) : 20,
    offset: Number(offset) >= 0 ? Number(offset) : 0,
  };
  if (id !== undefined && id !== null && String(id).trim() !== "") query.id = String(id);
  const queryPartnerType = getPartnerTypeForQuery(partnerType);
  if (queryPartnerType) query.partnerType = queryPartnerType;
  if (status && status !== "ALL") query.status = status;
  if (Number.isFinite(Number(partnerId))) query.partnerId = Number(partnerId);
  if (requestId) query.requestId = requestId;

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.INCENTIVE_PAYOUT, query);
};
