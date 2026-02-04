import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { chartsConfig } from "@/configs";
import { themeColors } from "@/theme/colors";

export const TripCompletionRate = ({ summary = {} }) => {
  const dateValue = summary?.period_start || summary?.period || "";
  const categories = dateValue ? [dateValue] : [];
  const completionRates = dateValue
    ? [Number(summary.trip_completion_rate ?? 0)]
    : [];

  const chartConfig = {
    type: "area",
    height: 260,
    series: [
      {
        name: "Trip completion rate (%)",
        data: completionRates,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#1D4ED8"],
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 50, 100],
        },
      },
      markers: {
        size: 4,
        colors: [themeColors.white],
        strokeColors: themeColors.info,
        strokeWidth: 2,
        hover: {
          sizeOffset: 2,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories,
        labels: {
          ...chartsConfig.xaxis.labels,
          rotate: -45,
          trim: true,
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
      grid: {
        ...chartsConfig.grid,
        padding: {
          ...chartsConfig.grid.padding,
          bottom: 10,
        },
      },
    },
  };

  return (
    <Card className="shadow-xl bg-white focus-visible:outline-none">
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
          Trip Completion Rate
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Daily percentage of completed trips out of total bookings.
        </Typography>
        <Chart {...chartConfig} />
      </CardHeader>
    </Card>
  );
};

export default TripCompletionRate;
