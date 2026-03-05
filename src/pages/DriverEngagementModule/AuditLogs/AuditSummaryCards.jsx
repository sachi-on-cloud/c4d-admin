import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const cards = [
  {
    key: "totalChanges",
    title: "Total Changes",
    icon: ClockIcon,
    containerClass: "border-blue-900 bg-blue-50 text-blue-900",
  },
  {
    key: "upgrades",
    title: "Upgrades",
    icon: ArrowTrendingUpIcon,
    containerClass: "border-yellow-900 bg-yellow-50 text-yellow-900",
  },
  {
    key: "downgrades",
    title: "Downgrades",
    icon: ArrowTrendingDownIcon,
    containerClass: "border-purple-900 bg-purple-50 text-purple-900",
  },
];

function AuditSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ key, title, icon: Icon, containerClass }) => (
        <Card key={key} className={`border shadow-none ${containerClass}`}>
          <CardBody className="flex gap-2 p-2">
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <Icon className={`h-7 w-7`} />
            </div>
            <div>
              <Typography variant="small" className={`text-sm font-semibold`}>{title}</Typography>
              <Typography variant="h3" className={`mt-1 text-xl font-bold`}>{summary?.[key] || 0}</Typography>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default AuditSummaryCards;
