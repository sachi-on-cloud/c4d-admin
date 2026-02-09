import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const AreaWiseHourlyDemandAllTripTypes = ({ filterParams, serviceType }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resolvedServiceTypes = serviceType
          ? serviceType // e.g. "Local" / "Drop" / "Outstation"
          : ["Local", "Drop", "Outstation"];

        const params = {
          filterType: filterParams?.filterType,
          zone: filterParams?.zone,
          date: filterParams?.date,
          serviceTypes: resolvedServiceTypes,
        };

        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_AREA_TRIP_HRS,params);

        if (data?.success && data.data) {
          setResponse(data.data);
        } else {
          setError("Failed to load area-wise hourly demand data.");
          setResponse(null);
        }
      } catch (err) {
        console.error("Error fetching area-wise hourly demand data:", err);
        setError("Failed to load area-wise hourly demand data.");
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.date, filterParams?.zone]);

  const title = serviceType
    ? `Area x Hour Demand Intensity (${serviceType})`
    : response?.title || "Area x Hour Demand Intensity (All Trip Types)";

  const xField = response?.xAxis?.field || "hour";
  const xLabel = response?.xAxis?.label || "Hour";
  const yField = response?.yAxis?.field || "area";
  const yLabel = response?.yAxis?.label || "Area";

  const data = response?.data || [];

  // X/Y axis buckets
  const hours = Array.from(new Set(data.map((item) => item[xField]).filter((v) => v !== undefined && v !== null)));
  const areas = Array.from(new Set(data.map((item) => item[yField]).filter((v) => v !== undefined && v !== null)));

  const getCellValue = (row) => {
    if (!row) return 0;

    if (serviceType === "Local") return row.localTrips || 0;
    if (serviceType === "Drop") return row.dropTrips || 0;
    if (serviceType === "Outstation") return row.outstationTrips || 0;

    // All trip types – prefer totalTrips, otherwise sum individual fields
    if (typeof row.totalTrips === "number") return row.totalTrips;
    const local = row.localTrips || 0;
    const drop = row.dropTrips || 0;
    const outstation = row.outstationTrips || 0;
    return local + drop + outstation;
  };

  const series = areas.map((area) => ({
    name: area,
    data: hours.map((hour) => {
      const match = data.find((row) => row[yField] === area && row[xField] === hour);
      return getCellValue(match);
    }),
  }));

  const dateLabel = (() => {
    const filterType = filterParams?.filterType;
    const rawDate = filterParams?.date;
    const rangeStart = response?.range?.start;
    const rangeEnd = response?.range?.end;

    if (!rawDate && !rangeStart && !rangeEnd) return "";

    const format = (val) => {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    if (filterType === "daily" && rawDate) {
      return format(rawDate);
    }

    if (
      (filterType === "weekly" || filterType === "monthly") &&
      rangeStart &&
      rangeEnd
    ) {
      return `${format(rangeStart)} to ${format(rangeEnd)}`;
    }

    if (filterType === "weekly" && rawDate) {
      const end = new Date(rawDate);
      if (Number.isNaN(end.getTime())) return format(rawDate);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return `${format(start)} to ${format(end)}`;
    }

    if (filterType === "monthly" && rawDate) {
      const base = new Date(rawDate);
      if (Number.isNaN(base.getTime())) return format(rawDate);
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      return `${format(start)} to ${format(end)}`;
    }

    if (rawDate) return format(rawDate);
    return "";
  })();

  // Color palette per service type (dark cell colors)
  const colorScaleRanges =
    serviceType === "Local"
      ? [
          // Local: 0 = dark grey, any trips = very dark amber
          { from: 0, to: 0, color: "#9ca3af" },
          { from: 1, to: 999999, color: "#f5c402" },
        ]
      : serviceType === "Drop"
      ? [
          // Drop: 0 = dark grey, any trips = very dark blue
          { from: 0, to: 0, color: "#9ca3af" },
          { from: 1, to: 999999, color: "#0243fa" },
        ]
      : serviceType === "Outstation"
      ? [
          // Outstation: 0 = dark grey, any trips = very dark orange
          { from: 0, to: 0, color: "#9ca3af" },
          { from: 1, to: 999999, color: "#9a3412" },
        ]
      : [
          // All Trip Types: 0 = dark grey, any trips = very dark blue
          { from: 0, to: 0, color: "#9ca3af" },
          { from: 1, to: 999999, color: "#1e3a8a" },
        ];

  const chartConfig = {
    type: "heatmap",
    height: 360,
    options: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#ffffff"],
          fontSize: "16px",
          fontWeight: 700,
        },
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.6,
          distributed: false,
          colorScale: {
            inverse: false,
            ranges: colorScaleRanges,
          },
        },
      },
      xaxis: {
        categories: hours,
        title: {
          text: xLabel,
        },
        labels: {
          style: {
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: true,
          color: "#e5e7eb",
        },
      },
      yaxis: {
        title: {
          text: yLabel,
        },
        labels: {
          style: {
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: true,
          color: "#e5e7eb",
        },
      },
      grid: {
        strokeDashArray: 4,
      },
      legend: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: (val) => `${val}`,
        },
      },
    },
    series,
  };

  // Enable horizontal scroll based on number of cells (hours/areas)
  const pointsCount = Math.max(hours.length, areas.length);
  const minChartWidth = Math.max(pointsCount * 80, 600);

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" className="text-gray-900">{title}</Typography>
        </div>
        {loading ? (
          <Typography variant="small" className="text-gray-500">Loading chart...</Typography>
        ) : error ? (
          <Typography variant="small" className="text-red-500">{error}</Typography>
        ) : series.length === 0 ? (
          <Typography variant="small" className="text-gray-500">No data available for the selected filters.</Typography>
        ) : (
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <div style={{ minWidth: `${minChartWidth}px` }}>
              <Chart type={chartConfig.type} height={chartConfig.height} options={chartConfig.options} series={chartConfig.series} />
            </div>
          </div>
        )}
        {dateLabel && !loading && !error && (
          <Typography variant="small" className="mt-4 text-xs text-gray-500 text-right">{dateLabel}</Typography>
        )}
      </CardBody>
    </Card>
  );
};

export default AreaWiseHourlyDemandAllTripTypes;
