import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { NAV_UI } from "@/utils/constants";
import { isSuperUserRole } from "@/utils/roleUtils";

function AdminSubmenu({ permissions = [] }) {
  const getItemClasses = (isActive) =>
    `${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${
      isActive
        ? `${NAV_UI.colors.topnavActiveBg} ${NAV_UI.colors.topnavActiveText}`
        : `${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`
    }`;

  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const isSuperUser = isSuperUserRole();

  const isMainItemActive = (label, path) => {
    const target = path.toLowerCase();

    if (label === "Version Control") {
      return (
        pathname.startsWith("/dashboard/user/versioncontrollist") ||
        pathname.startsWith("/dashboard/user/versioncontrol/")
      );
    }

    if (label === "Discount Module") {
      return pathname.startsWith("/dashboard/user/discountmodule");
    }

    if (label === "TAX") {
      return (
        pathname.startsWith("/dashboard/user/gstlist") ||
        pathname.startsWith("/dashboard/user/gst/")
      );
    }

    return pathname.startsWith(target);
  };

  const primaryItems = [
    { label: "Users", path: "/dashboard/users", requiredPermission: "Users" },
    { label: "Master Price Table", path: "/dashboard/users/master-price", requiredPermission: "Users" },
    { label: "Instant Reward", path: "/dashboard/users/instant-reward", requiredPermission: "Users" },
    { label: "GeoMarkings", path: "/dashboard/admin/geo-markings", requiredPermission: "Users" },
    { label: "Version Control", path: "/dashboard/user/versionControlList", requiredPermission: "Users" },
    { label: "Custom Discount", path: "/dashboard/users/custom-discount/list", requiredPermission: "Users" },
  ];

  // Secondary/shortcut items that can live on a second row
  const secondaryItems = [
    { label: "Driver Bonus", path: "/dashboard/users/driver-offer/list", requiredPermission: "Users" },
    { label: "Driver Ops", path: "/dashboard/driver-ops", requiredPermission: "Driver Ops" },
    { label: "Discount Module", path: "/dashboard/user/discountModuleList", requiredPermission: "Users" },
    { label: "TAX", path: "/dashboard/user/GSTList", requiredPermission: "Users" },
    { label: "Trip Master Details", path: "/dashboard/tripDetails", requiredPermission: "Trip Master" },
    { label: "Trip Master Report", path: "/dashboard/reports/tripMasterReport", requiredPermission: "Trip Master" },
    { label: "Calls", path: "/dashboard/exotel-calls/list", requiredPermission: "Calls" },
  ];
  const filteredPrimaryItems = primaryItems.filter(({ requiredPermission }) => permissions.includes(requiredPermission));
  const filteredSecondaryItems = secondaryItems.filter(({ requiredPermission, label }) => {
    if (label === "Trip Master Report" && !isSuperUser) return false;
    return permissions.includes(requiredPermission);
  });

  if (!filteredPrimaryItems.length && !filteredSecondaryItems.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className={NAV_UI.topnav.list}>
        {filteredPrimaryItems.map(({ label, path }) => (
          <li key={label}>
            <NavLink to={path} end={false}>
              <Button
                variant="text"
                className={getItemClasses(isMainItemActive(label, path))}
              >
                <Typography
                  color="inherit"
                  className={NAV_UI.typography.topnavLabel}
                >
                  {label}
                </Typography>
              </Button>
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className={NAV_UI.topnav.secondaryList}>
        {filteredSecondaryItems.map(({ label, path }) => (
          <li key={label}>
            <NavLink to={path} end={false}>
              <Button
                variant="text"
                className={getItemClasses(isMainItemActive(label, path))}
              >
                <Typography
                  color="inherit"
                  className={NAV_UI.typography.topnavLabel}
                >
                  {label}
                </Typography>
              </Button>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminSubmenu;
