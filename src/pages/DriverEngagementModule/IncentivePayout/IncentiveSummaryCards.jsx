import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ClockIcon, CreditCardIcon, WalletIcon } from "@heroicons/react/24/outline";

const cards = [
  {
    key: "pendingApproval",
    title: "Pending Approval",
    icon: ClockIcon,
    containerClass: "border-blue-900 bg-blue-50 text-blue-900",
  },
  {
    key: "readyToPay",
    title: "Ready to Pay",
    icon: CreditCardIcon,
    containerClass: "border-yellow-900 bg-yellow-50 text-yellow-900",
  },
  {
    key: "paidThisMonth",
    title: "Paid This Month",
    icon: WalletIcon,
    containerClass: "border-purple-900 bg-purple-50 text-purple-900",
  },
];

function IncentiveSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map(({ key, title, icon: Icon, containerClass }) => (
        <Card key={key} className={`shadow-none border ${containerClass}`}>
          <CardBody className="flex gap-2 p-2">
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <Icon className={`h-7 w-7`} />
            </div>
            <div className="w-full">
              <Typography variant="small" className={`text-sm font-semibold`}>{title}</Typography>
              <div className="mt-1 flex w-full items-end justify-between">
                <Typography variant="h3" className={`text-xl font-bold`}>
                  {summary?.[key]?.count || 0}
                </Typography>
                <Typography variant="h3" className={`text-xl font-semibold`}>
                  {summary?.[key]?.amount || "₹0"}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default IncentiveSummaryCards;
