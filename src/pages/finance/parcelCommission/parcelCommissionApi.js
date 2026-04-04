import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

const toOptionalNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const fetchParcelCommissionStateList = async ({
  status = "ALL",
  parcelVehicleType = "ALL",
} = {}) => {
  const query = {};

  const normalizedStatus = String(status || "").toUpperCase();
  if (normalizedStatus && normalizedStatus !== "ALL") {
    query.status = normalizedStatus;
  }

  const normalizedVehicleType = String(parcelVehicleType || "").toUpperCase();
  if (normalizedVehicleType && normalizedVehicleType !== "ALL") {
    query.parcelVehicleType = normalizedVehicleType;
  }

  return ApiRequestUtils.getWithQueryParam(API_ROUTES.PARCEL_COMMISSION_STATE, query);
};

export const fetchParcelCommissionHistory = async (stateId) => {
  return ApiRequestUtils.get(`${API_ROUTES.PARCEL_COMMISSION_HISTORY}/${stateId}`);
};

export const settleParcelCommissionRow = async ({
  parcelCommissionId,
  status,
  remarks,
  settledBy,
}) => {
  const body = {
    parcelCommissionId: Number(parcelCommissionId),
  };

  if (status) body.status = status;
  if (remarks) body.remarks = remarks;

  const safeSettledBy = toOptionalNumber(settledBy);
  if (safeSettledBy) body.settledBy = safeSettledBy;

  return ApiRequestUtils.post(API_ROUTES.PARCEL_COMMISSION_SETTLE, body);
};

export const settleParcelCommission = async ({stateId,status,remarks,settledBy}) => {
  const body = {
    stateId: Number(stateId),
  };

  if (status) body.status = status;
  if (remarks) body.remarks = remarks;

  const safeSettledBy = toOptionalNumber(settledBy);
  if (safeSettledBy) body.settledBy = safeSettledBy;

  return ApiRequestUtils.post(API_ROUTES.PARCEL_COMMISSION_SETTLE_ALL, body);
};
