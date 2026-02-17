import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { NAV_UI } from "@/utils/constants";

function CustomersSubmenu() {
  const getItemClasses = (isActive) =>
    `${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${
      isActive
        ? `${NAV_UI.colors.topnavActiveBg} ${NAV_UI.colors.topnavActiveText}`
        : `${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`
    }`;

  return (
    <ul className={NAV_UI.topnav.list}>
      {[
        { label: "All", path: "/dashboard/customers", icon: "/img/all.png" },
      ].map(({ label, path, icon }) => (
        <li key={label}>
          <NavLink to={path} end={false}>
            {({ isActive }) => (
              <Button
                variant="text"
                className={getItemClasses(isActive)}
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

export default CustomersSubmenu;
