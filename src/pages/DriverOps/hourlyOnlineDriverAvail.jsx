import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const HourlyOnlineDriverAvailability = ({ filterParams }) => {
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
        };

        const data = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.GET_DRIVER_ONLINE,
          params
        );

        if (data?.success) {
          setResponse(data.data);
        } else {
          setError("Failed to load hourly online driver data.");
        }
      } catch (err) {
        console.error("Error fetching hourly online driver data:", err);
        setError("Failed to load hourly online driver data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.date, filterParams?.zone]);

  const title = response?.title || "Hourly Online Driver Availability";
  const xField = response?.xAxis?.field || "timeSlot";
  const xLabel = response?.xAxis?.label || "Hour Range";
  const yField = response?.yAxis?.field || "onlineDrivers";
  const yLabel = response?.yAxis?.label || "Online Drivers";
  const data = response?.data || [];

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

    // Daily: always show just the selected date
    if (filterType === "daily" && rawDate) {
      return format(rawDate);
    }

    // Weekly / Monthly: prefer backend-provided range when available
    if (
      (filterType === "weekly" || filterType === "monthly") &&
      rangeStart &&
      rangeEnd
    ) {
      return `${format(rangeStart)} to ${format(rangeEnd)}`;
    }

    // Fallbacks when backend range is missing
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
  const seriesData = data.map((item) => item[yField]);

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
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.4,
          gradientToColors: ["#1d4ed8"],
          inverseColors: false,
          opacityFrom: 0.95,
          opacityTo: 0.95,
          stops: [0, 50, 100],
        },
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
      colors: ["#3b82f6"],
      tooltip: {
        y: {
          formatter: (val) => `${val} drivers`,
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
    series: [
      {
        name: "Online Drivers",
        data: seriesData,
      },
    ],
  };

  // Enable horizontal scroll – always wrap chart, width based on categories
  const pointsCount = categories.length;
  const minChartWidth = Math.max(pointsCount * 80, 600);

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-6">
        <Typography variant="h6" className="mb-4 text-gray-900">{title}</Typography>
        {loading ? (
          <Typography variant="small" className="text-gray-500">Loading chart...</Typography>
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

export default HourlyOnlineDriverAvailability;
