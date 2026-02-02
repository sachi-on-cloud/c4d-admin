import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { chartsConfig } from "@/configs";
import { themeColors } from "@/theme/colors";

export const DemandSupplyRatioChart = ({ report = [] }) => {
  const slots = report.map((item) => item.time_slot);
  const ratios = report.map((item) =>
    item.demand_supply_ratio == null
      ? null
      : Number(item.demand_supply_ratio ?? 0)
  );

  const chartConfig = {
    type: "bar",
    height: 260,
    series: [
      {
        name: "Demand / Online Drivers",
        data: ratios,
      },
    ],
    options: {
      ...chartsConfig,
      // Soft green bars for demand–supply
      colors: ["#22C55E"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 10,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: slots,
        title: {
          text: "Time slot (hours)",
        },
      },
      yaxis: {
        ...chartsConfig.yaxis,
        min: 0,
        labels: {
          ...chartsConfig.yaxis.labels,
          formatter: (value) => `${value.toFixed(1)}x`,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        ...chartsConfig.tooltip,
        y: {
          formatter: (value) =>
            value == null ? "No online drivers" : `${value.toFixed(2)}x`,
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
          Demand–Supply Ratio
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Ratio of customer requests to online drivers for each time slot.
        </Typography>
        <Chart {...chartConfig} />
      </CardHeader>
    </Card>
  );
};

export default DemandSupplyRatioChart;
