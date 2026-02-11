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
];

const TripTypeDemandTimeOfDayLine = ({ filterParams }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(SERVICE_TYPE_OPTIONS.map((o) => o.value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          filterType: filterParams?.filterType,
          zone: filterParams?.zone,
          date: filterParams?.date,
          serviceTypes: JSON.stringify(selectedTypes),
        };

        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DRIVER_SERVICES_TRIP_DEMAND,params);

        if (data?.success) {
          setResponse(data.data);
        } else {
          setError("Failed to load trip type demand data.");
        }
      } catch (err) {
        console.error("Error fetching trip type demand data:", err);
        setError("Failed to load trip type demand data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams?.filterType, filterParams?.date, filterParams?.zone, selectedTypes]);

  const title = response?.title === "Trips by Service Type" ? "Trips by Multiple Service Type" : "Trips by Multiple Service Type";
  const xField = response?.xAxis?.field || "timeSlot";
  const xLabel = response?.xAxis?.label || "Hour Range";
  const data = response?.data || [];
  const seriesConfig = response?.series || [];
  const yLabel = response?.yAxis?.label || "Trips Completed";

  const categories = data.map((item) => item[xField]);


  const series = seriesConfig
    .filter((cfg) => selectedTypes.includes(cfg.name))
    .map((cfg) => ({
      name: cfg.name,
      data: data.map((item) => item[cfg.field] || 0),
    }));

  const dateLabel = (() => {
    const filterType = filterParams?.filterType;
    const rawDate = filterParams?.date;
    if (!rawDate) return "";

    const base = new Date(rawDate);
    if (Number.isNaN(base.getTime())) return rawDate;

    const format = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    if (filterType === "daily") {
      return format(base);
    }

    if (filterType === "weekly") {
      const end = base;
      const start = new Date(base);
      start.setDate(end.getDate() - 6);
      return `${format(start)} to ${format(end)}`;
    }

    if (filterType === "monthly") {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      return `${format(start)} to ${format(end)}`;
    }

    return format(base);
  })();

  const chartConfig = {
    type: "area",
    height: 360,
    options: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: {
        enabled: false,
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
      // Darker, saturated palette for stronger lines/areas
      colors: ["#b91c1c", "#166534", "#1c09ca"],
      stroke: {
        curve: "smooth",
        width: 4,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.9,
          opacityFrom: 0.85,
          opacityTo: 0.25,
          stops: [0, 40, 100],
        },
      },
      markers: {
        size: 6,
        strokeWidth: 8,
        colors: ["#b91c1c", "#166534", "#1c09ca"],
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
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

  // Enable horizontal scroll when there are many time slots
  const pointsCount = categories.length;
  const minChartWidth = Math.max(pointsCount * 80, 600);

  return (
    <Card className="border border-blue-gray-100 shadow-sm rounded-2xl">
      <CardBody className="p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
          <div>
            <Typography variant="h6" className="text-gray-900">{title}</Typography>
          </div>
          <div className="w-full sm:w-2/6">
            <Select
              isMulti
              classNamePrefix="trip-type-select"
              options={SERVICE_TYPE_OPTIONS}
              value={SERVICE_TYPE_OPTIONS.filter((opt) =>
                selectedTypes.includes(opt.value)
              )}
              onChange={(opts) =>
                setSelectedTypes((opts || []).map((opt) => opt.value))
              }
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 40 }),
                control: (base) => ({
                  ...base,
                  minHeight: 32,
                  borderRadius: 9999,
                  fontSize: 12,
                  paddingTop: 0,
                  paddingBottom: 0,
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0.6px",
                }),
                multiValue: (base) => ({
                  ...base,
                  borderRadius: 9999,
                  backgroundColor: "#fed7aa",
                  padding: "0 2px",
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

export default TripTypeDemandTimeOfDayLine;
