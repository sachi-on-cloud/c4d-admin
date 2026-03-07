const normalizeToken = (value, fallback = "ALL") => {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized || fallback;
};

export const findZoneConflict = ({
  rows = [],
  type,
  partnerType,
  zone,
  excludeId,
  currentIsActive = true,
}) => {
  if (!currentIsActive) return null;

  const normalizedType = normalizeToken(type, "TIER_RULES");
  const normalizedPartnerType = normalizeToken(partnerType, "CAB");
  const normalizedZone = normalizeToken(zone, "ALL");
  const normalizedExcludeId = excludeId === undefined || excludeId === null ? null : String(excludeId);

  return (Array.isArray(rows) ? rows : []).find((row) => {
    if (!row) return false;
    if (normalizedExcludeId !== null && String(row.id) === normalizedExcludeId) return false;
    if (row.isActive !== true) return false;

    const rowType = normalizeToken(row.type, "TIER_RULES");
    const rowPartnerType = normalizeToken(row.partnerType, "CAB");
    const rowZone = normalizeToken(row.zone, "ALL");

    if (rowType !== normalizedType || rowPartnerType !== normalizedPartnerType) return false;

    if (normalizedZone === "ALL") return true;
    if (rowZone === "ALL") return true;
    return rowZone === normalizedZone;
  }) || null;
};

export const buildZoneConflictMessage = (zone) => {
  const normalizedZone = normalizeToken(zone, "ALL");
  if (normalizedZone === "ALL") {
    return "A tier already exists for all zones in this type and partner type.";
  }
  return `A tier already exists for zone ${normalizedZone} in this type and partner type.`;
};
