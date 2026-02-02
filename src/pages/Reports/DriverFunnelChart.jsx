import React from "react";
import { Card, CardHeader, Typography } from "@material-tailwind/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { themeColors } from "@/theme/colors";

export const DriverFunnelChart = ({ data = [] }) => {
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
          Driver Onboarding Funnel
        </Typography>
        <Typography
          variant="small"
          className="mb-3 text-sm font-normal text-blue-gray-500"
        >
          Conversion across each onboarding stage (latest period).
        </Typography>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="stage"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                barSize={18}
                radius={[0, 18, 18, 0]}
                fill="#38BDF8"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DriverFunnelChart;
