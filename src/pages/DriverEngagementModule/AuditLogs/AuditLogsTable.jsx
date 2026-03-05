import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const TABLE_HEAD = ["Date & Time", "Driver", "Phone Number", "Car Type", "Change Type", "Tier Change",  "Updated At", "Actions"];
const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    if (typeof value.type === "string" && value.type.trim()) return value.type;
    if (typeof value.tier === "string" && value.tier.trim()) return value.tier;
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const CHANGE_TYPE_CLASS = {
  UPGRADE: "bg-orange-100 text-orange-700",
  DOWNGRADE: "bg-purple-100 text-purple-700",
  OTHER: "bg-blue-gray-100 text-blue-gray-700",
};

function AuditLogsTable({ rows, loading, pagination, onPageChange, onView }) {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = rows.length || 10,
  } = pagination || {};

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Card className="border border-blue-gray-100 shadow-none">
      <CardBody className="overflow-x-auto px-0 py-0">
        <table className="w-full min-w-[980px] table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b border-blue-gray-50 py-3 px-5 text-left bg-primary">
                  <Typography variant="small" className="font-semibold text-white">{head}</Typography>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-10 text-center">
                  <Typography variant="small" color="gray">Loading audit logs...</Typography>
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="px-4 py-10 text-center">
                  <Typography variant="small" color="gray">No audit logs found.</Typography>
                </td>
              </tr>
            )}

            {!loading && rows.map((row, index) => {
              const cellClass = index === rows.length - 1 ? "px-4 py-3" : "border-b border-blue-gray-50 px-4 py-3";

              return (
                <tr key={row.id}>
                  <td className={cellClass}><Typography variant="small" className="text-blue-gray-700">{safeText(row.dateTimeDisplay)}</Typography></td>
                  <td className={cellClass}><Typography variant="small" className="font-semibold text-blue-gray-700">{safeText(row.driver)}</Typography></td>
                  <td className={cellClass}><Typography variant="small" className="text-blue-gray-700">{safeText(row.driverPhoneNumber)}</Typography></td>
                  <td className={cellClass}><Typography variant="small" className="text-blue-gray-700">{safeText(row.partnerCarType)}</Typography></td>
                  <td className={cellClass}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CHANGE_TYPE_CLASS[row.changeType] || CHANGE_TYPE_CLASS.OTHER}`}>
                      {safeText(row.changeTypeDisplay)}
                    </span>
                  </td>
                  <td className={cellClass}>
                    {((row?.tierFrom && row?.tierFrom !== "-") || (row?.tierTo && row?.tierTo !== "-")) ? (
                      <div className="flex items-center gap-1 text-blue-gray-700">
                        {row?.tierFrom && row?.tierFrom !== "-" ? (
                          <Typography variant="small" className="text-blue-gray-700">{safeText(row.tierFrom)}</Typography>
                        ) : null}
                        <ArrowRightIcon className="h-4 w-4 text-blue-gray-500" />
                        <Typography variant="small" className="text-blue-gray-700">{safeText(row.tierTo || "-")}</Typography>
                      </div>
                    ) : (
                      <Typography variant="small" className="text-blue-gray-700">{safeText(row.tierChange)}</Typography>
                    )}
                  </td>
                  <td className={cellClass}><Typography variant="small" className="text-blue-gray-700">{safeText(row.updatedAtDisplay)}</Typography></td>
                  <td className={cellClass}>
                    <Button
                      size="sm"
                      variant="text"
                      color="blue"
                      className="px-0 py-0 normal-case"
                      onClick={() => onView?.(row)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-blue-gray-100 px-4 py-3 sm:flex-row sm:items-center">
          <Typography variant="small" color="gray">{`Showing ${startIndex}-${endIndex} of ${totalItems}`}</Typography>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outlined"
              color="blue-gray"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className="normal-case"
            >
              Previous
            </Button>
            <Typography variant="small" className="font-semibold text-blue-gray-700">{`Page ${currentPage} / ${totalPages}`}</Typography>
            <Button
              size="sm"
              variant="outlined"
              color="blue-gray"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className="normal-case"
            >
              Next
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default AuditLogsTable;
