import React from "react";
import { Typography } from "@material-tailwind/react";

function KycStatusCards({ options = [], counts = {} }) {
  return (
    <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {options.map((item) => (
        <div key={item.value} className={`rounded-md border px-3 py-2 ${item.cardClass}`}>
          <Typography variant="small" className={`text-[11px] font-semibold uppercase ${item.textClass}`}>
            {item.label}
          </Typography>
          <Typography className={`text-lg font-bold ${item.textClass}`}>
            {counts[item.value] || 0}
          </Typography>
        </div>
      ))}
    </div>
  );
}

export default KycStatusCards;

