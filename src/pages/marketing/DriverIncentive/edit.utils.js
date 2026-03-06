export const getOptionValue = (option) =>
  typeof option === "string" ? option : option?.value || "";

export const getOptionLabel = (option) =>
  typeof option === "string" ? option : option?.label || option?.value || "";

export const getTargetComponent = (row = {}, selectedCode = "") => {
  const components = Array.isArray(row?.components)
    ? row.components
    : row?.component && typeof row.component === "object"
      ? [row.component]
      : [];

  if (!components.length) return null;
  if (!selectedCode) return components[0];
  return components.find((item) => item?.code === selectedCode) || components[0];
};

export const createEditableRule = (rule = {}, code = "") => {
  const condition = rule?.condition || {};
  const fallbackMetric = code === "ONLINE_HOURS_BONUS" ? "onlineHours" : "tripCount";
  const fallbackServiceType = code === "ONLINE_HOURS_BONUS" ? "ANY" : "RIDES";
  return {
    metric: condition?.metric || fallbackMetric,
    period: condition?.period || "WEEKLY",
    serviceType: condition?.serviceType || fallbackServiceType,
    op: condition?.op || ">=",
    value: String(condition?.value ?? ""),
    amount: String(rule?.amount ?? ""),
  };
};

export const createDefaultRule = (code = "") =>
  createEditableRule(
    {
      condition: {
        metric: code === "ONLINE_HOURS_BONUS" ? "onlineHours" : "tripCount",
        period: "WEEKLY",
        serviceType: code === "ONLINE_HOURS_BONUS" ? "ANY" : "RIDES",
        op: ">=",
        value: 1,
      },
      amount: 100,
    },
    code
  );

export const withCurrentOption = (options = [], currentValue = "") => {
  const value = String(currentValue || "").trim();
  if (!value) return options;
  const exists = options.some((option) => getOptionValue(option) === value);
  return exists ? options : [{ value, label: value }, ...options];
};
