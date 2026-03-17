import React from "react";
import { Card, CardBody, Button } from "@material-tailwind/react";
import { DRIVER_INCENTIVE_CODES } from "./driverIncentiveApi";

const formatLabel = (value) =>
  value
    .split("_")
    .map((item) => item.charAt(0) + item.slice(1).toLowerCase())
    .join(" ");

function DriverIncentiveTabs({ value, onChange }) {
  return (
    <Card className="inline-block border border-blue-gray-100 shadow-none">
      <CardBody className="flex flex-wrap gap-2 p-2">
        {DRIVER_INCENTIVE_CODES.map((tabValue) => {
          const isActive = value === tabValue;
          return (
            <Button
              key={tabValue}
              variant={isActive ? "filled" : "text"}
              color={isActive ? "teal" : "blue-gray"}
              onClick={() => onChange(tabValue)}
              className={`normal-case text-sm px-4 py-2 ${!isActive ? "text-blue-gray-700" : ""}`}
            >
              {formatLabel(tabValue)}
            </Button>
          );
        })}
      </CardBody>
    </Card>
  );
}

export default DriverIncentiveTabs;

