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
  const isFinanceActive = pathname.startsWith("/dashboard/finance");
  const isDriverEngagementActive = pathname.startsWith("/dashboard/driverengagement");

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

    if (label === "Booking Invoice") {
      return (
        pathname.startsWith("/dashboard/finance/bookinginvoicelist") ||
        pathname.startsWith("/dashboard/finance/bookinginvoice/")
      );
    }

    if (label === "Tier Details") {
      return (
        pathname === "/dashboard/driverengagement" ||
        pathname.startsWith("/dashboard/driverengagement/tier/")
      );
    }
    
    if (label === "Cash Back") {
      return pathname.startsWith("/dashboard/users/cash-back");
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
    { label: "TAX", path: "/dashboard/user/GSTList", requiredPermission: "Users" },
  ];

  // Secondary/shortcut items that can live on a second row
  const secondaryItems = [
    { label: "Cash Back", path: "/dashboard/users/cash-back/list", requiredPermission: "Users" },
    { label: "Driver Bonus", path: "/dashboard/users/driver-offer/list", requiredPermission: "Users" },
    { label: "Driver Engagement", path: "/dashboard/driverengagement", requiredPermission: "Driver Engagement" },
    { label: "Discount Module", path: "/dashboard/user/discountModuleList", requiredPermission: "Users" },
    { label: "Trip Master Details", path: "/dashboard/tripDetails", requiredPermission: "Trip Master" },
    { label: "Trip Master Report", path: "/dashboard/reports/tripMasterReport", requiredPermission: "Trip Master" },
  ];
  const financeSubItems = [
    { label: "Subscription Invoice", path: "/dashboard/finance/invoice", requiredPermission: "Finance" },
    { label: "Booking Receipt", path: "/dashboard/finance/receipt", requiredPermission: "Finance" },
    { label: "Master Subscription", path: "/dashboard/finance/master-subscription", requiredPermission: "Finance" },
    { label: "Booking Invoice", path: "/dashboard/finance/bookingInvoiceList", requiredPermission: "Finance" },
  ];
  const driverEngagementSubItems = [
    { label: "Tier Details", path: "/dashboard/driverengagement", requiredPermission: "Driver Engagement" },
    { label: "Driver Monitoring", path: "/dashboard/driverengagement/driver-monitoring", requiredPermission: "Driver Engagement" },
    { label: "Incentive Payout", path: "/dashboard/driverengagement/incentive-payout", requiredPermission: "Driver Engagement" },
    { label: "Audit Logs", path: "/dashboard/driverengagement/audit-logs", requiredPermission: "Driver Engagement" },
  ];

  const filteredPrimaryItems = primaryItems.filter(({ requiredPermission }) => permissions.includes(requiredPermission));
  const filteredSecondaryItems = secondaryItems.filter(({ requiredPermission, label }) => {
    if (label === "Trip Master Report" && !isSuperUser) return false;
    return permissions.includes(requiredPermission);
  });
  const filteredFinanceItems = financeSubItems.filter(({ requiredPermission }) => permissions.includes(requiredPermission));
  const filteredDriverEngagementItems = driverEngagementSubItems.filter(({ requiredPermission }) =>
    permissions.includes(requiredPermission)
  );
  const hasFinanceAccess = filteredFinanceItems.length > 0;
  const hasDriverEngagementAccess = filteredDriverEngagementItems.length > 0;

  if (!filteredPrimaryItems.length && !filteredSecondaryItems.length && !hasFinanceAccess && !hasDriverEngagementAccess) {
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
        {hasFinanceAccess && (
          <li>
            <NavLink to="/dashboard/finance/invoice" end={false}>
              <Button
                variant="text"
                className={getItemClasses(isFinanceActive)}
              >
                <Typography
                  color="inherit"
                  className={NAV_UI.typography.topnavLabel}
                >
                  Finance
                </Typography>
              </Button>
            </NavLink>
          </li>
        )}
      </ul>

      {hasFinanceAccess && isFinanceActive && (
        <ul className={NAV_UI.topnav.nestedList}>
          {filteredFinanceItems.map(({ label, path }) => (
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
      )}

      {hasDriverEngagementAccess && isDriverEngagementActive && (
        <ul className={NAV_UI.topnav.nestedList}>
          {filteredDriverEngagementItems.map(({ label, path }) => (
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
      )}
    </div>
  );
}

export default AdminSubmenu;
