import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const IndividualDriverTargetAchievement = ({ filterParams }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          filterType: filterParams?.filterType,
          zone: filterParams?.zone,
          date: filterParams?.date,
          localTarget: targetSummary?.localTarget, //== 0 ? 2 : 0 ,
          dropTarget : targetSummary?.dropTarget, //== 0 ? 2 : 0,
          outstationTarget : targetSummary?.outstationTarget, //== 0 ? 2 : 0,
        };

        const data = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.INDIVIDUAL_DRIVER_TARGET_ACHIEVEMENT,
          params
        );

        if (data?.success) {
          setResponse(data.data);
        } else {
          setError("Failed to load driver target achievement.");
        }
      } catch (err) {
        console.error("Error fetching driver target achievement:", err);
        setError("Failed to load driver target achievement.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.zone, filterParams?.date]);

  const title = response?.title || "Individual Driver Target Achievement";
  const targetSummary = response?.targetSummary;
  const rows = response?.rows || [];

  const renderTargetSummary = () => {
    if (!targetSummary) return null;
    const parts = [];
    if (targetSummary.localTarget != null) {
      parts.push(`${targetSummary.localTarget} Local`);
    }
    if (targetSummary.dropTarget != null) {
      parts.push(`${targetSummary.dropTarget} Drop`);
    }
    if (targetSummary.outstationTarget != null) {
      parts.push(`${targetSummary.outstationTarget} Outstation`);
    }
    if (!parts.length) return null;
    return (
      <Typography variant="small" className="text-xs text-gray-500 mt-1">
        Target: {parts.join(" | ")}
      </Typography>
    );
  };

  const renderMetricCell = (metric) => {
    if (!metric) return 0;
    const text = `${metric.completed}/${metric.target}`;
    const achieved = metric.achieved;
    const color = achieved ? "text-green-600" : "text-red-600";
    const symbol = achieved ? "✓" : "!";
    return (
      <span className={`text-sm font-medium ${color}`}>
        {text}{" "}
        <span className="font-bold">
          {symbol}
        </span>
      </span>
    );
  };

  const renderStatusPill = (status) => {
    if (!status) return 0;
    const upper = String(status).toUpperCase();
    const isAchieved = upper === "ACHIEVED";
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold inline-block";
    const cls = isAchieved
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
    return <span className={`${base} ${cls}`}>{upper}</span>;
  };

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Typography variant="h6" className="text-gray-900">{title}</Typography>
            {renderTargetSummary()}
          </div>
        </div>

        {loading ? (
          <Typography variant="small" className="text-gray-500">Loading driver targets...</Typography>
        ) : error ? (
          <Typography variant="small" className="text-red-500">{error}</Typography>
        ) : rows.length === 0 ? (
          <Typography variant="small" className="text-gray-500">No data available for the selected filters.</Typography>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Driver ID</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Car Number</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Ph.No</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Car Type</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Driver Name</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Local (T:{targetSummary?.localTarget || 0})</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Drop (T:{targetSummary?.dropTarget || 0})</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Outstation (T:{targetSummary?.outstationTarget || 0})</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Total Completed</th>
                  <th className="py-2 px-3 text-xs font-semibold text-gray-700 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.driverId || idx} className="border-b last:border-b-0">
                    <td className="py-2 px-3 text-sm text-gray-900">{row.driverId}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{row.carNumber}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{row.phoneNumber}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{row.carType}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{row.driverName || 0}</td>
                    <td className="py-2 px-3">{renderMetricCell(row.local)}</td>
                    <td className="py-2 px-3">{renderMetricCell(row.drop)}</td>
                    <td className="py-2 px-3">{renderMetricCell(row.outstation)}</td>
                    <td className="py-2 px-3 text-sm font-medium text-gray-900">
                      {row.totalCompleted
                        ? `${row.totalCompleted.completed}/${row.totalCompleted.target}`
                        : 0}
                    </td>
                    <td className="py-2 px-3">{renderStatusPill(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default IndividualDriverTargetAchievement;
