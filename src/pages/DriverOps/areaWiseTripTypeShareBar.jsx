import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { API_ROUTES } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const AreaWiseTripTypeShareBar = ({ filterParams, serviceType }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedServiceTypes = serviceType
          ? [serviceType] // e.g. ["Local"] / ["Drop"] / ["Outstation"]
          : ["Local", "Drop", "Outstation"];

        const params = {
          filterType: filterParams?.filterType,
          zone: filterParams?.zone,
          date: filterParams?.date,
          // backend expects a single array value, not repeated keys
          serviceTypes: JSON.stringify(resolvedServiceTypes),
        };

        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_AREA_TRIP_SHARE,params);

        if (data?.success && data.data) {
          setResponse(data.data);
        } else {
          setError("Failed to load area-wise trip type share data.");
          setResponse(null);
        }
      } catch (err) {
        console.error(
          "Error fetching area-wise trip type share data:",
          err
        );
        setError("Failed to load area-wise trip type share data.");
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.date, filterParams?.zone]);

  const title =
    response?.title || "Area-wise Trip Type Share";

  const xField = response?.xAxis?.field || "area";
  const xLabel = response?.xAxis?.label || "Area";
  const data = response?.data || [];
  const seriesConfig = response?.series || [];
  const yLabel = response?.yAxis?.label || "Trips";

  const categories = data.map((item) => item[xField]);
  const series = seriesConfig.map((cfg) => ({
    name: cfg.name,
    data: data.map((item) => item[cfg.field] || 0),
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

  const chartConfig = {
    type: "bar",
    height: 360,
    options: {
      chart: {
        stacked: false,
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
          gradientToColors: ["#b91c1c", "#fb7185", "#fecaca"],
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
      colors: ["#ef4444", "#fb7185", "#fecaca"],
      tooltip: {
        shared: true,
        intersect: false,
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

  // Enable horizontal scroll when there are many areas on x-axis
  const pointsCount = categories.length;
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

export default AreaWiseTripTypeShareBar;
