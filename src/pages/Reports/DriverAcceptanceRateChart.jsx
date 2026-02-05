import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { chartsConfig } from "@/configs";
import { themeColors } from "@/theme/colors";

export const DriverAcceptanceRateChart = ({ summary = {} }) => {
  const periodValue = summary?.period_start || summary?.period || "";
  const categories = periodValue ? [periodValue] : [];
  const acceptanceRates = periodValue
    ? [Number(summary.average_acceptance_rate ?? 0)]
    : [];
  const hasData = categories.length > 0 && acceptanceRates.length > 0;

  const chartConfig = {
    type: "line",
    height: 260,
    series: [
      {
        name: "Acceptance rate (%)",
        data: acceptanceRates,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#059669"],
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
        dashArray: 4,
      },
      markers: {
        size: 6,
        colors: ["#022C22"],
        strokeColors: "#6EE7B7",
        strokeWidth: 2,
        hover: {
          sizeOffset: 3,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories,
        labels: {
          ...chartsConfig.xaxis.labels,
          rotate: -30,
          formatter: (value) =>
            value
              ? new Date(value).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "2-digit",
                })
              : "",
        },
      },
      yaxis: {
        ...chartsConfig.yaxis,
        min: 0,
        max: 100,
        tickAmount: 5,
        labels: {
          ...chartsConfig.yaxis.labels,
          formatter: (value) => `${value}%`,
        },
      },
      tooltip: {
        ...chartsConfig.tooltip,
        y: {
          formatter: (value) => `${value.toFixed(2)}%`,
        },
      },
    },
  };

  return (
    <Card className="shaxldow-sm bg-white focus-visible:outline-none">
      <CardHeader
        floated={false}
        shadow={false}
        color="white"
        className="px-4 pt-4 pb-0"
      >
        <Typography
          variant="h6"
          className="mb-1 text-base font-semibold text-blue-gray-800"
        >
          Driver Acceptance Rate
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Share of customer requests that drivers accept.
        </Typography>
        {hasData ? (
          <Chart {...chartConfig} />
        ) : (
          <Typography
            variant="small"
            className="mb-4 text-xs text-blue-gray-400"
          >
            No data available for the selected period.
          </Typography>
        )}
      </CardHeader>
    </Card>
  );
};

export default DriverAcceptanceRateChart;
