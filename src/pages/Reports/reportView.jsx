import React, { useEffect, useState, useMemo } from "react";
import { Typography, Dialog, DialogHeader, DialogBody, Button, Input } from "@material-tailwind/react";
import { TripCompletionRate } from "./TripCompletionRate";
import { AverageWaitingTimeChart } from "./AverageWaitingTimeChart";
import { DriverAcceptanceRateChart } from "./DriverAcceptanceRateChart";
import { DemandSupplyRatioChart } from "./DemandSupplyRatioChart";
import { DriverFunnelChart } from "./DriverFunnelChart";
import { DriverChurnRateChart } from "./DriverChurnRateChart";
import { DriverEarningsChart } from "./DriverEarningsChart";
import { DriverRatingDistributionChart } from "./DriverRatingDistributionChart";
import { ReportsSubmenu } from "./ReportsSubmenu";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

export const ReportView = () => {
  const [activeTab, setActiveTab] = useState("operations");
  const [type, setType] = useState("daily");
  const [zone, setZone] = useState("All");
  const [serviceAreas, setServiceAreas] = useState([
    "Vellore",
    "Chennai",
    "kanchipuram",
  ]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError("");
        // Skip fetch until custom range is chosen
        if (type === "custom" && (!customStartDate || !customEndDate)) {
          return;
        }

        const params = { type, zone };
        if (type === "custom") {
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
        const response = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.REPORT,
          params
        );
        if (response?.success && response?.dashboardSummary) {
          setDashboardSummary(response.dashboardSummary);
          if (
            Array.isArray(response.dashboardSummary.serviceArea) &&
            response.dashboardSummary.serviceArea.length > 0
          ) {
            setServiceAreas(response.dashboardSummary.serviceArea);
          }
        } else {
          setError(response?.message || "Unable to load reports.");
        }
      } catch (err) {
        console.error("Error fetching dashboard reports", err);
        setError("Unable to load reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [type, zone, customStartDate, customEndDate]);

  const operationsDashboard = dashboardSummary?.operationsDashboard || {};
  const driverDashboard = dashboardSummary?.driverDashboard || {};

  const driverFunnelData = useMemo(() => {
    const raw = driverDashboard.driverFunnel;
    if (!Array.isArray(raw) || raw.length === 0) return undefined;
    const stages = [
      { key: "signups", label: "Signups" },
      { key: "document_submitted", label: "Docs Submitted" },
      { key: "verified", label: "Verified" },
      { key: "first_trip_completed", label: "First Trip" },
    ];
    return stages.map(({ key, label }) => ({
      stage: label,
      value: raw.reduce(
        (sum, item) => sum + (Number(item?.[key]) || 0),
        0
      ),
    }));
  }, [driverDashboard.driverFunnel]);

  const driverEarningsAggregated = useMemo(() => {
    const raw = driverDashboard.driverEarnings;
    if (!Array.isArray(raw) || raw.length === 0) return undefined;

    // raw is array of arrays; flatten then aggregate per period
    const flat = raw.flat().filter(Boolean);
    const byDate = flat.reduce((acc, item) => {
      const period = item.period;
      if (!period) return acc;
      if (!acc[period]) {
        acc[period] = { period, total_earnings: 0, total_trips: 0 };
      }
      acc[period].total_earnings += Number(item.total_earnings || 0);
      acc[period].total_trips += Number(item.total_trips || 0);
      return acc;
    }, {});

    return Object.values(byDate).map((row) => ({
      ...row,
      avg_earnings_per_trip:
        row.total_trips > 0
          ? Number(row.total_earnings / row.total_trips)
          : 0,
    }));
  }, [driverDashboard.driverEarnings]);

  const driverRatingDistribution = useMemo(() => {
    const raw = driverDashboard.driverRatings;
    if (!Array.isArray(raw) || raw.length === 0) return undefined;

    const flat = raw.flat().filter(Boolean);
    const grouped = flat.reduce((acc, item) => {
      const rating = item.rating;
      if (rating == null) return acc;
      if (!acc[rating]) {
        acc[rating] = { name: `${rating}★`, value: 0 };
      }
      acc[rating].value += Number(item.trip_count || 0);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [driverDashboard.driverRatings]);

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-blue-gray-900 via-blue-800 to-blue-900 px-6 py-4 shadow-sm">
        <Typography
          variant="h5"
          className="font-semibold text-white tracking-tight"
        >
          Root Cabs Operations & Driver Insights
        </Typography>
        <Typography
          variant="small"
          className="mt-1 text-sm text-blue-100"
        >
          Monitor trip performance, supply-demand health and driver engagement
          in one glance.
        </Typography>
      </div>

      <div className="mt-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div>
            <ReportsSubmenu
              value={activeTab}
              onChange={setActiveTab}
              type={type}
              onTypeChange={setType}
              onOpenCustomDate={() => setShowDateModal(true)}
              zone={zone}
              onZoneChange={setZone}
              serviceAreas={serviceAreas}
            />
          </div>

          {isLoading && (
            <Typography
              variant="small"
              className="mt-4 text-sm text-blue-gray-500"
            >
              Loading dashboard reports…
            </Typography>
          )}

          {error && !isLoading && (
            <Typography
              variant="small"
              className="mt-4 text-sm text-red-500"
            >
              {error}
            </Typography>
          )}

          {!isLoading && !error && (
            <>
              {activeTab === "operations" && (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <TripCompletionRate
                    report={
                      operationsDashboard.tripCompletion?.report
                    }
                  />
                  <AverageWaitingTimeChart
                    report={
                      operationsDashboard.averageWaitingTime?.report
                    }
                  />
                  <DriverAcceptanceRateChart
                    report={
                      operationsDashboard.driverAcceptanceRate?.report
                    }
                  />
                  <DemandSupplyRatioChart
                    report={
                      operationsDashboard.demandSupplyRatio?.report
                    }
                  />
                </div>
              )}

              {activeTab === "drivers" && (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <DriverFunnelChart data={driverFunnelData} />
                  <DriverChurnRateChart
                    data={driverDashboard.driverChurnRate}
                  />
                  <DriverEarningsChart data={driverEarningsAggregated} />
                  <DriverRatingDistributionChart
                    data={driverRatingDistribution}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={showDateModal}
        handler={() => setShowDateModal(false)}
        size="sm"
      >
        <DialogHeader>Select Date Range</DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
              Start Date
            </Typography>
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
              End Date
            </Typography>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                setShowDateModal(false);
                setType("daily");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (customStartDate && customEndDate) {
                  setShowDateModal(false);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};
