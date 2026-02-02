import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { themeColors } from "@/theme/colors";

export const DriverEarningsChart = ({ data = [] }) => {
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
          Average Driver Earnings
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Daily total earnings (bar) with average earnings per trip (line).
        </Typography>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#0F172A" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                  })
                }
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "Avg earnings / trip"
                    ? [`₹${value.toFixed(2)}`, name]
                    : [`₹${value}`, name]
                }
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="total_earnings"
                name="Total earnings"
                barSize={20}
                radius={[4, 4, 0, 0]}
                fill="#4F46E5"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_earnings_per_trip"
                name="Avg earnings / trip"
                stroke="#22C55E"
                strokeWidth={2.2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DriverEarningsChart;
