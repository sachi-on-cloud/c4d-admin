import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { chartsConfig } from "@/configs";

export const NoShowRateChart = ({ summary = {} }) => {
  const dateValue = summary?.period_start || summary?.period || "";
  const categories = dateValue ? [dateValue] : [];

  const customerRate = Number(summary.customer_no_show_rate ?? 0);
  const driverRate = Number(summary.driver_no_show_rate ?? 0);

  const series = [
    {
      name: "Customer no-show rate",
      data: categories.length ? [customerRate] : [],
    },
    {
      name: "Driver no-show rate",
      data: categories.length ? [driverRate] : [],
    },
  ];
  const hasData = categories.length > 0;

  const chartConfig = {
    type: "bar",
    height: 260,
    series,
    options: {
      ...chartsConfig,
      colors: ["#EF4444", "#3B82F6"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 6,
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
                  year: "numeric",
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
          formatter: (val) => `${val}%`,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        ...chartsConfig.tooltip,
        y: {
          formatter: (val) => `${val.toFixed(2)}%`,
        },
      },
      legend: {
        show: true,
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
          No-Show Rate (Customer vs Driver)
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Percentage of confirmed trips where the customer or driver did not show up.
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

export default NoShowRateChart;

