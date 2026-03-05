import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

export const DRIVER_INCENTIVE_CODES = [
  "ONLINE_HOURS_BONUS",
  "SERVICE_TRIP_BONUS",
];

export const fetchDriverIncentiveList = async ({
  code = "ONLINE_HOURS_BONUS",
  partnerType = "CAB",
  zone = "ALL",
  vehicleType = "ALL",
  settingId,
} = {}) => {
  const params = {
    code,
    partnerType,
    zone,
    vehicleType,
  };

  if (settingId !== undefined && settingId !== null && settingId !== "") {
    params.settingId = settingId;
  }

  const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.DRIVER_INCENTIVE, params);
  return response || {};
};

export const updateDriverIncentiveComponent = async ({
  settingId,
  name,
  description,
  isActive = true,
  scope = {},
  component = {},
}) => {
  const payload = {
    component,
  };

  if (settingId !== undefined && settingId !== null && settingId !== "") {
    payload.settingId = Number(settingId);
  }

  if (typeof name === "string" && name.trim()) {
    payload.name = name.trim();
  }
  if (typeof description === "string" && description.trim()) {
    payload.description = description.trim();
  }
  payload.isActive = Boolean(isActive);
  payload.scope = scope && typeof scope === "object" ? scope : {};

  const response = await ApiRequestUtils.update(API_ROUTES.DRIVER_INCENTIVE_EDIT, payload);
  return response || {};
};

export const updateDriverIncentiveStatus = async ({
  settingId,
  code,
  enabled,
  scope = {},
}) => {
  const parsedSettingId = Number(settingId);
  if (!Number.isFinite(parsedSettingId) || parsedSettingId <= 0) {
    throw new Error("settingId is required for status update");
  }

  const payload = {
    settingId: parsedSettingId,
    code,
    enabled: Boolean(enabled),
  };

  if (scope && typeof scope === "object") {
    payload.scope = scope;
  }

  const response = await ApiRequestUtils.patch(API_ROUTES.DRIVER_INCENTIVE_STATUS, payload);
  return response || {};
};
