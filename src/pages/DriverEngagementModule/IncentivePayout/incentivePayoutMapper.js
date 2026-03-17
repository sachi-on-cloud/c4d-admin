import moment from "moment";

const toUpper = (value) => String(value || "").trim().toUpperCase();

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = moment(value);
  if (!parsed.isValid()) return "-";
  return parsed.format("DD-MMM-YYYY");
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = moment(value);
  if (!parsed.isValid()) return "-";
  return parsed.format("DD-MMM-YYYY / hh:mm A");
};

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const toDisplayText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const joined = value.map((item) => toDisplayText(item, "")).filter(Boolean).join(", ");
    return joined || fallback;
  }
  if (typeof value === "object") {
    if (typeof value.name === "string" && value.name.trim()) return value.name;
    if (typeof value.type === "string" && value.type.trim()) return value.type;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const pickDisplay = (...values) => {
  for (const value of values) {
    const text = toDisplayText(value, "");
    if (text) return text;
  }
  return "-";
};

const getTypeDisplay = (row = {}) => {
  const rawType = row?.type || row?.incentiveType || row?.payoutType;
  if (typeof rawType === "string" && rawType.trim()) return rawType;
  if (rawType && typeof rawType === "object") {
    const nestedType = toDisplayText(rawType.type, "");
    if (nestedType) return nestedType;
    const nestedTier = toDisplayText(rawType.tier, "");
    if (nestedTier) return nestedTier;
    const fallbackType = toDisplayText(rawType, "");
    if (fallbackType) return fallbackType;
  }
  if (typeof row?.tier === "string" && row.tier.trim()) return row.tier;
  if (typeof row?.partnerType === "string" && row.partnerType.trim()) return row.partnerType;
  return "-";
};

const getIncentiveRuleDisplay = (row = {}) => {
  const incentiveRule = row?.ruleSnapshot?.incentiveRule;
  if (!incentiveRule || typeof incentiveRule !== "object") return "-";

  const components = Array.isArray(incentiveRule.components) ? incentiveRule.components : [];
  const enabledComponents = components
    .filter((component) => component?.enabled)
    .map((component) => toDisplayText(component?.code, ""))
    .filter(Boolean);

  if (enabledComponents.length > 0) {
    return enabledComponents.join(", ");
  }

  if (components.length > 0) {
    const allCodes = components
      .map((component) => toDisplayText(component?.code, ""))
      .filter(Boolean);
    if (allCodes.length > 0) return allCodes.join(", ");
  }

  return toDisplayText(incentiveRule, "-");
};

export const normalizePayoutStatus = (value) => {
  const status = toUpper(value);
  if (
    [
      "CALCULATED",
      "PAID",
      "CANCELLED",
      "REQUESTED",
    ].includes(status)
  ) return status;
  return "CALCULATED";
};

export const mapPayoutRows = (rows = []) => {
  return rows.map((row, index) => {
    const id = row?._id || row?.id || row?.payoutId || row?.requestId || `payout-${index + 1}`;
    const status = normalizePayoutStatus(row?.status);
    const weekStart = formatDate(row?.weekStart);
    const weekEnd = formatDate(row?.weekEnd);
    const weekWindow =
      weekStart !== "-" || weekEnd !== "-"
        ? `Week: ${weekStart} - ${weekEnd}`
        : "-";

    const firstDriver = Array.isArray(row?.partnerRelation?.drivers)
      ? row.partnerRelation.drivers[0]
      : null;

    return {
      id: String(id),
      driver: pickDisplay(
        firstDriver?.firstName,
        [firstDriver?.firstName, firstDriver?.lastName].filter(Boolean).join(" "),
        row?.partnerName,
        row?.driverName,
        row?.driver?.name,
        row?.name,
        row?.partnerId ? `Partner ${row.partnerId}` : ""
      ),
      driverPhoneNumber: pickDisplay(
        firstDriver?.phoneNumber,
        row?.partnerRelation?.account?.phoneNumber,
        row?.driver?.phoneNumber,
        row?.driver?.mobileNumber,
        row?.gpayNumber,
        row?.upiNumber
      ),
      partnerCarType: pickDisplay(
        row?.partnerRelation?.partner?.carType,
        row?.partnerRelation?.partner?.vehicleType,
        row?.vehicleType
      ),
      incentiveRule: getIncentiveRuleDisplay(row),
      type: getTypeDisplay(row),
      amount: Number(row?.amount || row?.totalAmount || row?.totalIncentive || row?.weeklyIncentive || 0),
      amountDisplay: formatAmount(row?.amount || row?.totalAmount || row?.totalIncentive || row?.weeklyIncentive || 0),
      gpayNumber: pickDisplay(
        row?.gpayNumber,
        row?.upiNumber,
        row?.driver?.gpayNumber,
        row?.driver?.mobileNumber,
        row?.referenceId
      ),
      reason: pickDisplay(row?.reason, row?.remarks, row?.description, weekWindow),
      status,
      statusDisplay: status.replaceAll("_", " "),
      evaluatedAtDisplay: formatDateTime(row?.evaluatedAt || row?.evaluated_at),
      updatedAtDisplay: formatDateTime(row?.updatedAt || row?.updated_at || row?.modifiedAt || row?.modified_at),
      dateDisplay: formatDate(row?.updatedAt || row?.createdAt || row?.date),
      raw: row,
    };
  });
};

export const buildPayoutSummary = (rows = [], serverSummary) => {
  if (serverSummary) {
    const pendingSummary = serverSummary.pendingApproval || {};
    const readySummary = serverSummary.readyToPay || {};
    const paidSummary = serverSummary.paidThisMonth || {};

    const pendingCount = Number(
      pendingSummary.count || serverSummary.pendingApprovalCount || serverSummary.pendingCount || 0
    );
    const pendingAmount = Number(
      pendingSummary.amount || serverSummary.pendingApprovalAmount || serverSummary.pendingAmount || 0
    );
    const readyCount = Number(
      readySummary.count || serverSummary.readyToPayCount || serverSummary.approvedCount || 0
    );
    const readyAmount = Number(
      readySummary.amount || serverSummary.readyToPayAmount || serverSummary.approvedAmount || 0
    );
    const paidCount = Number(
      paidSummary.count || serverSummary.paidThisMonthCount || serverSummary.paidCount || 0
    );
    const paidAmount = Number(
      paidSummary.amount || serverSummary.paidThisMonthAmount || serverSummary.paidAmount || 0
    );

    return {
      pendingApproval: { count: pendingCount, amount: formatAmount(pendingAmount) },
      readyToPay: { count: readyCount, amount: formatAmount(readyAmount) },
      paidThisMonth: { count: paidCount, amount: formatAmount(paidAmount) },
    };
  }

  const pending = rows.filter((item) => item.status === "CALCULATED");
  const approved = rows.filter((item) => item.status === "REQUESTED");
  const paid = rows.filter((item) => item.status === "PAID");

  const totalAmount = (items) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    pendingApproval: { count: pending.length, amount: formatAmount(totalAmount(pending)) },
    readyToPay: { count: approved.length, amount: formatAmount(totalAmount(approved)) },
    paidThisMonth: { count: paid.length, amount: formatAmount(totalAmount(paid)) },
  };
};
