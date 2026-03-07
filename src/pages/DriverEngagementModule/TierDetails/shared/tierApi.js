export const normalizeTierRows = (rows = []) =>
  (Array.isArray(rows) ? rows : []).map((row, index) => {
    const id = row?.id || row?._id || row?.tierId || String(index + 1);
    const activeValue = row?.isActive;
    const isActive =
      typeof activeValue === "boolean"
        ? activeValue
        : String(activeValue || row?.status || "")
            .toUpperCase()
            .trim() === "TRUE" ||
          String(activeValue || row?.status || "")
            .toUpperCase()
            .trim() === "ACTIVE";
    const updatedAtRaw = row?.updatedAt || row?.updatedDate || row?.createdAt || "";

    return {
      id: String(id),
      type: row?.type || row?.ruleType || "TIER_RULES",
      name: row?.name || "",
      description: row?.description || "",
      isActive,
      updatedAt: updatedAtRaw ? String(updatedAtRaw).slice(0, 10) : "-",
      raw: row,
    };
  });
