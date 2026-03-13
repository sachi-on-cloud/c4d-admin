import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { API_ROUTES, MONTH_LIST } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const parseChartRows = (payload) => {
  const body = payload?.data ?? payload?.result ?? payload;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.rows)) return body.rows;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.list)) return body.list;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const STATUS_OPTIONS = ["", "PENDING", "SUCCESS", "FAILED"];
const PAYMENT_TYPE_OPTIONS = ["", "PAYU_SUBSCRIPTION", "SUBSCRIPTION", "PAYU_BOOKING", "WALLET_SUBSCRIPTION"];
const formatOptionLabel = (value) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
const SERIES_COLORS = [
  "#5b2a86", // total count
  "#374151", // success count
  "#7c2d12", // pending count
  "#7f1d1d", // failed count
  "#312e81", // total amount
  "#1f2937", // success amount
  "#78350f", // pending amount
  "#4c1d95", // failed amount
];

const DriverTransactionsChart = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const [filterType, setFilterType] = useState("daily");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true);
        setError("");

        const today = new Date().toISOString().split("T")[0];
        const params = {};

        const formatDate = (val) => {
          const d = new Date(val);
          if (Number.isNaN(d.getTime())) return "";
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        };

        if (filterType === "daily") {
          params.filterType = "daily";
          params.date = today;
        } else if (filterType === "weekly") {
          params.filterType = "weekly";
          const end = new Date(today);
          const start = new Date(end);
          start.setDate(end.getDate() - 6);
          params.startDate = formatDate(start);
          params.endDate = formatDate(end);
        } else if (filterType === "monthly") {
          params.filterType = "date";
          const start = new Date(Number(year), Number(month) - 1, 1);
          const end = new Date(Number(year), Number(month), 0);
          params.startDate = formatDate(start);
          params.endDate = formatDate(end);
        }

        if (status) params.status = status;
        if (paymentType) params.paymentType = paymentType;

        const response = await ApiRequestUtils.getWithQueryParam(
          API_ROUTES.GET_TRANSACTIONS_CHART,
          params
        );

        if (!response?.success) {
          setCategories([]);
          setSeries([]);
          setError("Failed to load transactions chart.");
          return;
        }

        const rows = parseChartRows(response);
        const nextCategories = rows.map((row, idx) => row?.label || row?.bucket || `Bucket ${idx + 1}`);

        const nextSeries = [
          {
            name: "Total Count",
            type: "bar",
            yAxisIndex: 0,
            data: rows.map((row) => toNumber(row?.totalCount)),
          },
          {
            name: "Success Count",
            type: "bar",
            yAxisIndex: 0,
            data: rows.map((row) => toNumber(row?.successCount)),
          },
          {
            name: "Pending Count",
            type: "bar",
            yAxisIndex: 0,
            data: rows.map((row) => toNumber(row?.pendingCount)),
          },
          {
            name: "Failed Count",
            type: "bar",
            yAxisIndex: 0,
            data: rows.map((row) => toNumber(row?.failedCount)),
          },
          {
            name: "Total Amount",
            type: "line",
            yAxisIndex: 1,
            data: rows.map((row) => toNumber(row?.totalAmount)),
          },
          {
            name: "Success Amount",
            type: "line",
            yAxisIndex: 1,
            data: rows.map((row) => toNumber(row?.successAmount)),
          },
          {
            name: "Pending Amount",
            type: "line",
            yAxisIndex: 1,
            data: rows.map((row) => toNumber(row?.pendingAmount)),
          },
          {
            name: "Failed Amount",
            type: "line",
            yAxisIndex: 1,
            data: rows.map((row) => toNumber(row?.failedAmount)),
          },
        ];

        setCategories(nextCategories);
        setSeries(nextSeries);
      } catch (err) {
        console.error("Error fetching transactions chart:", err);
        setCategories([]);
        setSeries([]);
        setError("Failed to load transactions chart.");
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [filterType, month, year, status, paymentType]);

  const xLabel = "Label";
  // Enable horizontal scroll when there are many time slots
  const pointsCount = categories.length;
  const minChartWidth = Math.max(pointsCount * 80, 600);
  const seriesWithFiniteData = series.map((item) => ({
    ...item,
    data: (item?.data || []).map((value) => toNumber(value)),
  }));
  const countSeries = seriesWithFiniteData.slice(0, 4);
  const amountSeries = seriesWithFiniteData.slice(4);
  const countMax = Math.max(
    0,
    ...countSeries.flatMap((item) => item.data || [])
  );
  const amountMax = Math.max(
    0,
    ...amountSeries.flatMap((item) => item.data || [])
  );
  const chartKey = `${categories.length}-${seriesWithFiniteData
    .map((item) => item.data.length)
    .join("-")}`;
  const chartConfig = {
    type: "line",
    height: 280,
    options: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 4,
        borderColor: "#cbd5e1",
        padding: {
          left: 8,
          right: 8,
          bottom: 8,
        },
      },
      xaxis: {
        categories,
        title: {
          text: xLabel,
        },
        axisTicks: {
          show: true,
          color: "#64748b",
        },
        labels: {
          show: true,
          hideOverlappingLabels: false,
          trim: false,
          style: {
            fontSize: "12px",
            colors: "#334155",
          },
        },
        axisBorder: {
          show: true,
          color: "#334155",
        },
      },
      yaxis: [
        {
          min: 0,
          max: Math.max(1, countMax),
          forceNiceScale: false,
          tickAmount: 5,
          title: { text: "Count" },
          axisTicks: {
            show: true,
            color: "#334155",
          },
          labels: {
            style: { fontSize: "12px", colors: "#334155" },
            formatter: (val) => `${Math.round(val)}`,
          },
          axisBorder: {
            show: true,
            color: "#334155",
          },
        },
        {
          opposite: true,
          min: 0,
          max: Math.max(1, amountMax),
          forceNiceScale: false,
          tickAmount: 5,
          title: { text: "Amount" },
          axisTicks: {
            show: true,
            color: "#334155",
          },
          labels: {
            style: { fontSize: "12px", colors: "#334155" },
            formatter: (val) => `${Math.round(val)}`,
          },
          axisBorder: {
            show: true,
            color: "#334155",
          },
        },
      ],
      colors: SERIES_COLORS,
      stroke: {
        curve: "straight",
        width: [0, 0, 0, 0, 3, 3, 3, 3].slice(0, seriesWithFiniteData.length),
        colors: SERIES_COLORS,
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          borderRadius: 4,
        },
      },
      fill: {
        type: "solid",
        opacity: 1,
      },
      markers: {
        size: [0, 0, 0, 0, 4, 4, 4, 4].slice(0, seriesWithFiniteData.length),
        strokeWidth: 2,
        strokeColors: "#ffffff",
        colors: SERIES_COLORS,
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
    series: seriesWithFiniteData,
  };

  return (
    <div className="rounded-xl border border-gray-300 p-3 sm:p-4 bg-white">
      <Typography variant="small" className="font-semibold text-gray-800 mb-2">
        Transactions Chart
      </Typography>
      <div className="mb-3 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="inline-flex w-fit rounded-full bg-gray-100 p-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType("daily")}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === "daily" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-700"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setFilterType("weekly")}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === "weekly" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-700"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setFilterType("monthly")}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === "monthly" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-700"
            }`}
          >
            Monthly
          </button>
        </div>

        {filterType === "monthly" ? (
          <>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full sm:w-auto min-w-[140px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {MONTH_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {new Date(2000, Number(m.value) - 1, 1).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2025"
              max="2100"
              className="w-full sm:w-auto min-w-[110px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </>
        ) : null}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-auto min-w-[160px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option || "all-status"} value={option}>
              {option ? formatOptionLabel(option) : "All Status"}
            </option>
          ))}
        </select>

        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="w-full sm:w-auto min-w-[170px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {PAYMENT_TYPE_OPTIONS.map((option) => (
            <option key={option || "all-payment-type"} value={option}>
              {option ? formatOptionLabel(option) : "All Payment Type"}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Typography variant="small" className="text-gray-500">
          Loading chart...
        </Typography>
      ) : error ? (
        <Typography variant="small" className="text-red-500">
          {error}
        </Typography>
      ) : series.length === 0 || categories.length === 0 ? (
        <Typography variant="small" className="text-gray-500">
          No chart data available for selected filters.
        </Typography>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <Typography variant="small" className="text-gray-700 font-medium mb-2">
            Transaction Count & Amount
          </Typography>
          <div style={{ minWidth: `${minChartWidth}px` }} className="overflow-y-hidden">
            <Chart
              key={chartKey}
              type={chartConfig.type}
              height={chartConfig.height}
              options={chartConfig.options}
              series={chartConfig.series}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTransactionsChart;
