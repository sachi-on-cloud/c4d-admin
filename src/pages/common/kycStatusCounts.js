export const EMPTY_KYC_STATUS_COUNTS = {
  VERIFIED: 0,
  "PENDING VERIFICATION": 0,
  "PENDING UPLOAD": 0,
  DECLINED: 0,
  NOT_INTERESTED: 0,
  NO_RESPONSE: 0,
  INVALID: 0,
};

const STATUS_KEY_MAP = {
  VERIFIED: "VERIFIED",
  Verified: "VERIFIED",
  "PENDING VERIFICATION": "PENDING VERIFICATION",
  PENDING_VERIFICATION: "PENDING VERIFICATION",
  PendingVerification: "PENDING VERIFICATION",
  "Pending Verification": "PENDING VERIFICATION",
  "PENDING UPLOAD": "PENDING UPLOAD",
  PENDING_UPLOAD: "PENDING UPLOAD",
  PendingUpload: "PENDING UPLOAD",
  "Pending Upload": "PENDING UPLOAD",
  DECLINED: "DECLINED",
  Declined: "DECLINED",
  NOT_INTERESTED: "NOT_INTERESTED",
  NotInterested: "NOT_INTERESTED",
  "Not Interested": "NOT_INTERESTED",
  NO_RESPONSE: "NO_RESPONSE",
  NoResponse: "NO_RESPONSE",
  "No Response": "NO_RESPONSE",
  INVALID: "INVALID",
  Invalid: "INVALID",
};

export const normalizeKycStatusValue = (value) => STATUS_KEY_MAP[value] || value;

export const normalizeKycStatusFilterValues = (values = []) =>
  values.map((value) => normalizeKycStatusValue(value));

const getRawCounts = (response = {}) =>
  response?.kycStatusCounts ||
  response?.data?.kycStatusCounts ||
  response?.pagination?.kycStatusCounts ||
  response?.meta?.kycStatusCounts ||
  response?.counts ||
  {};

export const normalizeKycStatusCounts = (rawCounts = {}) => {
  const normalized = { ...EMPTY_KYC_STATUS_COUNTS };

  Object.entries(rawCounts).forEach(([rawKey, rawValue]) => {
    const targetKey = normalizeKycStatusValue(rawKey);
    if (!Object.prototype.hasOwnProperty.call(normalized, targetKey)) return;
    const numericValue = Number(rawValue);
    normalized[targetKey] = Number.isFinite(numericValue) ? numericValue : 0;
  });

  return normalized;
};

export const extractKycStatusCounts = (response = {}) =>
  normalizeKycStatusCounts(getRawCounts(response));

