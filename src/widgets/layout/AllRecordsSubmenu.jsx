import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { Feature } from "@/utils/constants";

function AllRecordsSubmenu({ miniSidenav }) {
  const items = [
    { label: "All", path: "/dashboard/booking/list", icon: "/img/all.png" },
    { label: "Drivers", path: "/dashboard/booking/list/actingDriver", icon: "/img/driver.png" },
    { label: "Rides", path: "/dashboard/booking/list/rides", icon: "/img/rides.png" },
    { label: "Rentals", path: "/dashboard/booking/list/rentals", icon: "/img/rental.png" },
    ...(Feature.parcel
      ? [{ label: "Parcel", path: "/dashboard/booking/list/Parcel", icon: "/img/Parcel_driver.png" }]
      : []),
  ];

  return (
    <ul className="flex items-center gap-6  overflow-x-auto whitespace-nowrap">
      {items.map(({ label, path, icon }) => (
        <li key={label}>
          <NavLink to={path} end={false}>
            {({ isActive }) => (
              <Button
                variant="text"
                className={`flex items-center gap-2 pb-2 px-0 rounded-none bg-transparent text-sm capitalize border-b-2 ${
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-blue-gray-600 hover:text-primary-600 hover:border-primary-300"
                }`}
              >
                <Typography
                  color="inherit"
                  className="font-medium px-3 capitalize tracking-normal"
                >
                  {label}
                </Typography>
              </Button>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default AllRecordsSubmenu;
