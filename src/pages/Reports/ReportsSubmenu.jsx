import React from "react";
import {
  Button,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
} from "@material-tailwind/react";
import {
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { key: "operations", label: "Operations Dashboard" },
  { key: "drivers", label: "Driver Dashboard" },
];

export const ReportsSubmenu = ({
  value,
  onChange,
  type,
  onTypeChange,
  onOpenCustomDate,
  zone,
  onZoneChange,
  serviceAreas = [],
}) => {
  const zoneOptions = ["All", ...serviceAreas];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl  bg-white">
      <div className="flex items-center gap-3">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={value === tab.key ? "gradient" : "text"}
            color={value === tab.key ? "blue" : "blue-gray"}
            className="flex items-center gap-2 px-4 capitalize rounded-2xl"
            size="sm"
            onClick={() => onChange(tab.key)}
          >
            <Typography
              color="inherit"
              className="font-medium text-sm capitalize"
            >
              {tab.label}
            </Typography>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Typography
          variant="small"
          className="hidden md:flex items-center gap-2 text-xs font-medium text-blue-gray-500"
        >
          <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
          <span className="capitalize">{type}</span>
          <span className="mx-1 text-blue-gray-300">•</span>
          <MapPinIcon className="h-4 w-4 text-amber-500" />
          <span className="capitalize">{zone}</span>
        </Typography>

        <Menu placement="bottom-end">
          <MenuHandler>
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center gap-2 rounded-full border-blue-gray-200 px-3 py-1"
            >
              <FunnelIcon className="h-4 w-4 text-blue-gray-600" />
              <span className="text-xs font-medium text-blue-gray-700">
                Filters
              </span>
            </Button>
          </MenuHandler>
          <MenuList className="w-64 p-3">
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase text-blue-gray-400">
                  Type
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "daily", label: "Daily" },
                  { key: "weekly", label: "Weekly" },
                  { key: "monthly", label: "Monthly" },
                  { key: "thismonth", label: "This Month" },
                  { key: "today", label: "Today" },
                  { key: "custom", label: "Custom" },
                ].map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={type === opt.key ? "gradient" : "outlined"}
                    color={type === opt.key ? "blue" : "blue-gray"}
                    className="rounded-full px-3 py-1 text-xs"
                    onClick={() => {
                      if (opt.key === "custom") {
                        onTypeChange?.("custom");
                        onOpenCustomDate?.();
                      } else {
                        onTypeChange?.(opt.key);
                      }
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-2 border-t border-blue-gray-50 pt-3">
              <div className="mb-2 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold uppercase text-blue-gray-400">
                  Zone
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {zoneOptions.map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={zone === opt ? "gradient" : "outlined"}
                    color={zone === opt ? "blue" : "blue-gray"}
                    className="rounded-full px-3 py-1 text-xs"
                    onClick={() => onZoneChange?.(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
};

export default ReportsSubmenu;
