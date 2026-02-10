import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import Select from "react-select";

const SERVICE_TYPE_OPTIONS = [
  { value: "Local", label: "Local" },
  { value: "Drop", label: "Drop" },
  { value: "Outstation", label: "Outstation" },
  // "Hourly", "Driver" can be added if needed
];

const HourlyLocalTripDemandLine = ({ filterParams }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState(SERVICE_TYPE_OPTIONS[0].value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          filterType: filterParams?.filterType,
          zone: filterParams?.zone,
          date: filterParams?.date,
          serviceTypes: serviceType,
        };

        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_SERVICES_TRIP_DEMAND,params);

        if (data?.success) {
          setResponse(data.data);
        } else {
          setError("Failed to load Hourly Local Trip Demand Line.");
        }
      } catch (err) {
        console.error("Error fetching Hourly Local Trip Demand Line:", err);
        setError("Failed to load Hourly Local Trip Demand.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.date, filterParams?.zone, serviceType]);

  const title = response?.title || "Hourly Local Trip Demand";
  const xField = response?.xAxis?.field || "timeSlot";
  const xLabel = response?.xAxis?.label || "Hour Range";
  const yLabel = response?.yAxis?.label || "Local Bookings";
  const data = response?.data || [];
  const seriesConfig = response?.series || [];

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

  const categories = data.map((item) => item[xField]);
  const series = seriesConfig.map((cfg) => ({
    name: cfg.name,
    data: data.map((item) => item[cfg.field] || 0),
  }));

  const chartConfig = {
    type: "bar",
    height: 360,
    options: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: {
        enabled: true,
        offsetY: -4,
        style: {
          fontSize: "16px",
          fontWeight: 600,
          colors: ["#ffffff"],
        },
        formatter: (val) => Math.round(val),
      },
      grid: {
        strokeDashArray: 4,
      },
      xaxis: {
        categories,
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
          formatter: (val) => `${Math.round(val)}`,
        },
        axisBorder: {
          show: true,
          color: "#e5e7eb",
        },
      },
      // Dark violet bars so they stand out clearly.
      colors: ["#4c1d95"],
      tooltip: {
        enabled: true,
        shared: false,
        intersect: true,
        y: {
          formatter: (val) => `${val}`,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "60%",
          borderRadius: 6,
        },
      },
      legend: {
        show: true,
        position: "bottom",
        markers: {
          radius: 4,
        },
      },
    },
    series,
  };

  // Enable horizontal scroll when many time slots are shown
  const pointsCount = categories.length;
  const minChartWidth = Math.max(pointsCount * 80, 600);

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
          <div>
            <Typography variant="h6" className="text-gray-900">{title}</Typography>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-56">
            <Select
              classNamePrefix="local-trip-service-select"
              options={SERVICE_TYPE_OPTIONS}
              value={SERVICE_TYPE_OPTIONS.find(
                (opt) => opt.value === serviceType
              )}
              onChange={(opt) => setServiceType(opt?.value || SERVICE_TYPE_OPTIONS[0].value)}
              isSearchable={false}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 40 }),
                control: (base) => ({
                  ...base,
                  minHeight: 32,
                  borderRadius: 9999,
                  fontSize: 12,
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0 8px",
                }),
                menu: (base) => ({
                  ...base,
                  fontSize: 12,
                  maxHeight: 220,
                }),
              }}
            />
          </div>
        </div>
        {loading ? (
          <Typography variant="small" className="text-gray-500">Loading chart... </Typography>
        ) : error ? (
          <Typography variant="small" className="text-red-500">{error}</Typography>
        ) : data.length === 0 ? (
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

export default HourlyLocalTripDemandLine;
