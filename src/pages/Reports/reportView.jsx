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
import { NoShowRateChart } from "./NoShowRateChart";
import { ReportsSubmenu } from "./ReportsSubmenu";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";

export const ReportView = () => {
  const [activeTab, setActiveTab] = useState("operations");
  const [type, setType] = useState("today");
  const [zone, setZone] = useState("All");
  const [serviceAreas, setServiceAreas] = useState([]);
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

        const params = {
          type,
          zone,
          tab: activeTab, // "operations" or "drivers"
        };
        if (type === "custom") {
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
        const response = await ApiRequestUtils.getWithQueryParam(API_ROUTES.REPORT,params);
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
  }, [type, zone, activeTab, customStartDate, customEndDate]);

  const operationsDashboard = dashboardSummary?.operationsDashboard || {};
  const driverDashboard = dashboardSummary?.driverDashboard || {};

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-blue-gray-900 via-blue-800 to-blue-900 px-6 py-4 shadow-sm">
        <Typography variant="h5" className="font-semibold text-white tracking-tight">
          Root Cabs Operations & Driver Insights
        </Typography>
        <Typography variant="small" className="mt-1 text-sm text-blue-100">
          Monitor trip performance, supply-demand health and driver engagement in one glance.
        </Typography>
      </div>

      <div className="mt-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div>
            <ReportsSubmenu value={activeTab} onChange={setActiveTab} type={type} onTypeChange={setType} onOpenCustomDate={() => setShowDateModal(true)} zone={zone} onZoneChange={setZone} serviceAreas={serviceAreas} />
          </div>

          {isLoading && (
            <Typography variant="small" className="mt-4 text-sm text-blue-gray-500"> Loading dashboard reports… </Typography>
          )}

          {error && !isLoading && (
            <Typography variant="small"className="mt-4 text-sm text-red-500">{error} </Typography>
          )}

          {!isLoading && !error && (
            <>
              {activeTab === "operations" && (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <TripCompletionRate summary={operationsDashboard.tripCompletion?.summary} />
                  <AverageWaitingTimeChart summary={operationsDashboard.averageWaitingTime?.summary} />
                  <DriverAcceptanceRateChart summary={operationsDashboard.driverAcceptanceRate?.summary} />
                  <DemandSupplyRatioChart summary={operationsDashboard.demandSupplyRatio?.summary} />
                  <NoShowRateChart summary={operationsDashboard.noShowRateData?.summary} />
                </div>
              )}

              {activeTab === "drivers" && (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <DriverFunnelChart summary={driverDashboard.driverFunnel?.summary} />
                   <DriverChurnRateChart summary={driverDashboard.driverChurnRate?.summary} />
                   <DriverEarningsChart summary={driverDashboard.driverEarnings?.summary} />
                   <DriverRatingDistributionChart summary={driverDashboard.driverRatings?.summary} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showDateModal} handler={() => setShowDateModal(false)} size="sm">
        <DialogHeader>Select Date Range</DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">Start Date</Typography>
            <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">End Date</Typography>
            <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="text" size="sm"
              onClick={() => {
                setShowDateModal(false);
                setType("today");
              }}
            >
              Cancel
            </Button>
            <Button size="sm"
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
