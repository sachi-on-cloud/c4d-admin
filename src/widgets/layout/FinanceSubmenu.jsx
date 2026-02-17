import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { NAV_UI } from "@/utils/constants";

function FinanceSubmenu() {
  const getItemClasses = (isActive) =>
    `${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${
      isActive
        ? `${NAV_UI.colors.topnavActiveBg} ${NAV_UI.colors.topnavActiveText}`
        : `${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`
    }`;

  const items = [
    { label: "Subscription Invoice", path: "/dashboard/finance/invoice", icon: "/img/subscription.png" },
    { label: "Booking Receipt", path: "/dashboard/finance/receipt", icon: "/img/recipt.png" },
    { label: "Master Subscription", path: "/dashboard/finance/master-subscription", icon: "/img/master_price.png" },
  ];

  return (
    <ul className={NAV_UI.topnav.list}>
      {items.map(({ label, path, icon }) => (
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

export default FinanceSubmenu;
