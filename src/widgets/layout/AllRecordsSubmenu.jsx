import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { Feature, NAV_UI } from "@/utils/constants";

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
    <ul className={NAV_UI.topnav.list}>
      {items.map(({ label, path, icon }) => (
        <li key={label}>
          <NavLink to={path} end={false}>
            {({ isActive }) => (
              <Button
                variant="text"
                className={`${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${
                  isActive
                    ? `${NAV_UI.colors.topnavActiveBg} ${NAV_UI.colors.topnavActiveText}`
                    : `${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`
                }`}
              >
                <Typography
                  color="inherit"
                  className={NAV_UI.typography.topnavLabel}
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
