import React, { Fragment, useState } from "react";
import { Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import moment from "moment";

const EXPAND_ICON_PATH = "/img/expand.png";

const TABLE_HEAD = [
  "Bonus",
  "Partner Type",
  "Valid From",
  "Valid To",
  "Payout Frequency",
  "Is Active",
  "Zone",
  "Action",
  "Expand",
];

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const formatCodeLabel = (code) => {
  const value = safeText(code, "-");
  if (value === "ONLINE_HOURS_BONUS") return "Online Hours Bonus";
  if (value === "SERVICE_TRIP_BONUS") return "Service Trip Bonus";
  return value;
};

const formatPayoutFrequencyLabel = (value) => {
  const normalized = safeText(value, "-").toUpperCase();
  if (normalized === "WEEKLY") return "Weekly";
  if (normalized === "DAILY" || normalized === "DALIY") return "Daily";
  return safeText(value, "-");
};

const formatRuleMetricLabel = (value) => {
  const normalized = safeText(value, "-");
  if (normalized === "onlineHours") return "Online Hours";
  if (normalized === "tripCount") return "Trip Count";
  return normalized;
};

const formatRulePeriodLabel = (value) => {
  const normalized = safeText(value, "-").toUpperCase();
  if (normalized === "WEEKLY") return "Weekly";
  if (normalized === "DAILY" || normalized === "DALIY") return "Daliy";
  return safeText(value, "-");
};

const formatRuleServiceTypeLabel = (value) => {
  const normalized = safeText(value, "-").toUpperCase();
  if (normalized === "ANY") return "All";
  if (normalized === "RIDES") return "Local";
  if (normalized === "RENTAL_HOURLY_PACKAGE") return "Hourly Package";
  if (normalized === "RENTAL_OUTSTATION" || normalized === "RENTAL") return "Round Trip";
  if (normalized === "RENTAL_DROP_TAXI" || normalized === "DROP_TAXI") return "Drop Taxi";
  return safeText(value, "-");
};

const formatLabelCase = (value) => {
  const text = safeText(value, "-");
  if (text === "-") return text;
  const normalized = String(text).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toBooleanOrNull = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return null;
};

const formatDateTime = (value) => {
  if (value === null || value === undefined) return "-";
  const raw = String(value).trim();
  if (!raw || raw === "-") return "-";
  const parsed = moment(
    raw,
    [moment.ISO_8601, "YYYY-MM-DDTHH:mm", "YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"],
    true
  );
  return parsed.isValid() ? parsed.format("YYYY-MM-DD hh:mm A") : "-";
};

const getComponent = (row) => {
  const raw = row?.raw || {};
  if (raw?.component && typeof raw.component === "object") return raw.component;
  if (Array.isArray(raw?.components) && raw.components[0] && typeof raw.components[0] === "object") {
    return raw.components[0];
  }
  if (Array.isArray(raw?.config?.components) && raw.config.components[0] && typeof raw.config.components[0] === "object") {
    return raw.config.components[0];
  }
  return {};
};

function DriverIncentiveTable({ rows, loading, error, onEdit }) {
  const [expandedRowIds, setExpandedRowIds] = useState({});

  const toggleExpand = (rowId) => {
    setExpandedRowIds((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  return (
    <Card className="border border-blue-gray-100 shadow-none">
      <CardBody className="overflow-x-auto px-0 py-0">
        <table className="w-full min-w-[1800px] table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-blue-gray-50 bg-primary px-5 py-3 text-left">
                  <Typography variant="small" className="font-semibold text-white">
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-10 text-center">
                  <Typography variant="small" color="gray">
                    Loading driver incentives...
                  </Typography>
                </td>
              </tr>
            )}

            {!loading && !!error && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-10 text-center">
                  <Typography variant="small" color="red">
                    {safeText(error, "Failed to load driver incentives")}
                  </Typography>
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-10 text-center">
                  <Typography variant="small" color="gray">
                    No records found.
                  </Typography>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row, index) => {
                const isExpanded = Boolean(expandedRowIds[row.id]);
                const component = getComponent(row);
                const rules = Array.isArray(component?.rules) ? component.rules : [];
                const isActiveBool = toBooleanOrNull(row?.raw?.isActive ?? row?.isActive);
                const cellClass =
                  index === rows.length - 1
                    ? "px-4 py-3"
                    : "border-b border-blue-gray-50 px-4 py-3";
                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatCodeLabel(row.code)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatLabelCase(row.partnerType)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatDateTime(row.validFrom)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatDateTime(row.validTo)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatPayoutFrequencyLabel(row.payoutFrequency)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <Chip
                          variant="ghost"
                          value={isActiveBool === true ? "Active" : isActiveBool === false ? "Inactive" : "-"}
                          className={`w-fit px-2 py-0.5 text-[11px] font-medium ${
                            isActiveBool === true
                              ? "bg-green-50 text-green-700"
                              : isActiveBool === false
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-gray-50 text-blue-gray-600"
                          }`}
                        />
                      </td>
                      <td className={cellClass}>
                        <Typography variant="small" className="text-blue-gray-700">
                          {formatLabelCase(row.zone)}
                        </Typography>
                      </td>
                      <td className={cellClass}>
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(row)}
                          className="rounded-md border border-blue-gray-200 px-3 py-1 text-xs font-semibold text-blue-gray-700"
                        >
                          Edit
                        </button>
                      </td>
                      <td className={cellClass}>
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.id)}
                          className="rounded-md border border-blue-gray-200 p-1 text-blue-gray-700"
                          aria-label={isExpanded ? "Collapse rules" : "Expand rules"}
                        >
                          <img
                            src={EXPAND_ICON_PATH}
                            alt={isExpanded ? "Hide rules" : "View rules"}
                            className="h-4 w-4 rounded-sm object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              if (event.currentTarget.nextElementSibling) {
                                event.currentTarget.nextElementSibling.style.display = "inline";
                              }
                            }}
                          />
                          <span className="hidden px-1 text-xs font-semibold">+</span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={TABLE_HEAD.length} className="border-b border-blue-gray-50 bg-blue-gray-50 px-4 py-3">
                          {rules.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[980px] table-auto text-left">
                                <thead>
                                  <tr>
                                    {[
                                      "Rule #",
                                      "Amount",
                                      "Metric",
                                      "Period",
                                      "Service Type",
                                      "Operator",
                                      "Value",
                                    ].map((head) => (
                                      <th key={`${row.id}-${head}`} className="border-b border-blue-gray-100 px-3 py-2">
                                        <Typography variant="small" className="text-[11px] font-semibold text-blue-gray-700">
                                          {head}
                                        </Typography>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {rules.map((rule, ruleIndex) => {
                                    const condition = rule?.condition || {};
                                    return (
                                      <tr key={`${row.id}-rule-${ruleIndex}`}>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{ruleIndex + 1}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{safeText(rule?.amount)}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{formatRuleMetricLabel(condition?.metric)}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{formatRulePeriodLabel(condition?.period)}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{formatRuleServiceTypeLabel(condition?.serviceType)}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{safeText(condition?.op)}</td>
                                        <td className="border-b border-blue-gray-100 px-3 py-2 text-xs text-blue-gray-800">{safeText(condition?.value)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <Typography variant="small" color="gray">
                              No rules available for this component.
                            </Typography>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export default DriverIncentiveTable;
