import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { chartsConfig } from "@/configs";
import { themeColors } from "@/theme/colors";

export const AverageWaitingTimeChart = ({ report = [] }) => {
  const sorted = [...report].sort((a, b) => new Date(a.day) - new Date(b.day));

  const categories = sorted.map((item) => item.day);
  const avgEtaValues = sorted.map((item) =>
    Number(item.average_eta_minutes ?? 0)
  );
  const totalBookings = sorted.map((item) =>
    Number(item.total_bookings ?? 0)
  );

  const chartConfig = {
    type: "line",
    height: 260,
    series: [
      {
        name: "Avg ETA (minutes)",
        data: avgEtaValues,
        type: "line",
      },
      {
        name: "Total bookings",
        data: totalBookings,
        type: "column",
      },
    ],
    options: {
      ...chartsConfig,
      // Orange line + soft yellow bars
      colors: ["#EA580C", "#FACC15"],
      stroke: {
        curve: "smooth",
        width: [3, 0],
        lineCap: "round",
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          borderRadius: 4,
        },
      },
      markers: {
        size: 5,
        colors: ["#FACC15"],
        strokeColors: "#D97706",
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
        labels: {
          ...chartsConfig.yaxis.labels,
          formatter: (value) => `${value.toFixed(1)} min`,
        },
      },
      tooltip: {
        ...chartsConfig.tooltip,
        y: {
          formatter: (value) => `${value.toFixed(2)} min`,
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
          Average Customer Waiting Time
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Average ETA (in minutes) for completed trips per day.
        </Typography>
        <Chart {...chartConfig} />
      </CardHeader>
    </Card>
  );
};

export default AverageWaitingTimeChart;
