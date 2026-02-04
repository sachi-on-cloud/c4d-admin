import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { themeColors } from "@/theme/colors";

export const DriverChurnRateChart = ({ summary = {} }) => {
  const data = [
    {
      label: "Overall",
      churn_rate_pct: Number(summary.overall_churn_rate_pct ?? 0),
    },
  ];
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
          Driver Churn Rate
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Percentage of active drivers who did not return in the next period.
        </Typography>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#111827" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Line
                type="monotone"
                dataKey="churn_rate_pct"
                stroke="#F97373"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: "#F97373", strokeWidth: 2, fill: "#111827" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DriverChurnRateChart;
