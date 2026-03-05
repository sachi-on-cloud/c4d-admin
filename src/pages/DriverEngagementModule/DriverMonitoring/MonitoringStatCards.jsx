import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
  UserGroupIcon,
  TrophyIcon,
  SparklesIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

const statsMeta = [
  {
    key: "totalDrivers",
    label: "Total Drivers",
    icon: UserGroupIcon,
    containerClass: "border-blue-900 bg-blue-50 text-blue-900",
  },
  {
    key: "silverTier",
    label: "Silver Tier",
    icon: TrophyIcon,
    containerClass: "border-yellow-900 bg-yellow-50 text-yellow-900",
  },
  {
    key: "goldTier",
    label: "Gold Tier",
    icon: TrophyIcon,
    containerClass: "border-purple-900 bg-purple-50 text-purple-900",
  },
  {
    key: "eliteTier",
    label: "Elite Tier",
    icon: SparklesIcon,
    containerClass: "border-green-900 bg-green-50 text-green-900",
  },
  {
    key: "activeNow",
    label: "Active Now",
    icon: SignalIcon,
    containerClass: "border-pink-900 bg-pink-50 text-pink-900",
  },
];

function MonitoringStatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {statsMeta.map(({ key, label, icon: Icon, containerClass }) => (
        <Card key={key} className={`border border-blue-gray-100 shadow-none ${containerClass}`}>
          <CardBody className={`flex items-center gap-3 p-4`}>
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <Typography variant="small" className="font-medium">
                {label}
              </Typography>
              <Typography variant="h4" className={`text-2xl`}>
                {stats[key] || 0}
              </Typography>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default MonitoringStatCards;
