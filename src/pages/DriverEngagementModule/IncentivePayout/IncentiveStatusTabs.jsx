import React from "react";
import { Card, CardBody, Button } from "@material-tailwind/react";

const STATUS_TABS = [
  { label: "All", value: "ALL" },
  { label: "Pending Approval", value: "CALCULATED" },
  { label: "Approved", value: "REQUESTED" },
  { label: "Paid", value: "PAID" },
  { label: "Rejected", value: "CANCELLED" },
];

function IncentiveStatusTabs({ value, onChange }) {
  return (
    <Card className="inline-block border border-blue-gray-100 shadow-none">
      <CardBody className="flex flex-wrap gap-2 p-2">
        {STATUS_TABS.map((tab) => {
          const isActive = value === tab.value;

          return (
            <Button
              key={tab.value}
              variant={isActive ? "filled" : "text"}
              color={isActive ? "teal" : "blue-gray"}
              onClick={() => onChange(tab.value)}
              className={`normal-case text-sm px-4 py-2 ${!isActive ? "text-blue-gray-700" : ""}`}
            >
              {tab.label}
            </Button>
          );
        })}
      </CardBody>
    </Card>
  );
}

export default IncentiveStatusTabs;
