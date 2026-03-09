import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { Feature, NAV_UI } from "@/utils/constants";

function VendorsSubmenu({ miniSidenav }) {
  const getItemClasses = (isActive) =>
    `${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${
      isActive
        ? `${NAV_UI.colors.topnavActiveBg} ${NAV_UI.colors.topnavActiveText}`
        : `${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`
    }`;

  const submenuToggleClasses = `${NAV_UI.topnav.buttonBase} ${NAV_UI.spacing.topnavButton} ${NAV_UI.typography.topnavLabel} ${NAV_UI.colors.topnavInactiveText} ${NAV_UI.topnav.buttonHover}`;

  const [openBikeSubMenu, setOpenBikeSubMenu] = useState("");
  const [openAutoSubMenu, setOpenAutoSubMenu] = useState("");
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const isMainItemActive = (label, path) => {
    const target = path.toLowerCase();

    switch (label) {
      case "Owners":
        // Only highlight Owners on the main owners page
        return pathname === "/dashboard/vendors/account";
      case "Acting Driver":
        return pathname.startsWith("/dashboard/vendors/account/drivers");
      case "Vehicles":
        // Treat vehicles list + allVehicles (+ details/edit) as Vehicles tab
        return (
          pathname.startsWith("/dashboard/vendors/vehiclelist") ||
          pathname.startsWith("/dashboard/vendors/account/allvehicles")
        );
      case "Online Vehicles List":
        return pathname.startsWith("/dashboard/vendors/onlinevehicleslist");
      case "Auto Owner":
        return pathname.startsWith("/dashboard/vendors/account/autoview");
      case "Auto List" :
        return pathname.startsWith("/dashboard/vendors/account/autolist");
      case "All Document Verification":
        return pathname.startsWith("/dashboard/doc-verification");
      case "All Pending Documents":
        return pathname.startsWith("/dashboard/doc-verification/pending");
      default:
        return pathname.startsWith(target);
    }
  };

  const items = [
    { label: "All Cab Owners", path: "/dashboard/vendors/account", icon: "/img/owners.png" },
    { label: "All Acting Driver", path: "/dashboard/vendors/account/drivers", icon: "/img/acting_driver.png" },
    { label: "All Auto Owner", path: "/dashboard/vendors/account/autoview", icon: "/img/parcel_list.png" },
    { label: "All Cab List", path: "/dashboard/vendors/vehicleList", icon: "/img/vehicles.png" },
    { label: "Online Vehicles List", path: "/dashboard/vendors/onlineVehiclesList", icon: "/img/vehicleslist.png" },
    { label: "All Auto List", path: "/dashboard/vendors/account/autoList", icon: "/img/auto.png" },
    { label: "All Document Verification", path: "/dashboard/doc-verification", icon: "/img/all.png" },
    { label: "All Pending Documents", path: "/dashboard/doc-verification/pending", icon: "/img/pending_doc.png" },
    ...(Feature.parcel
      ? [
          {
            label: "Bike",
            isSubMenu: true,
            icon: "/img/multiple_bike.jpg",
            subItems: [
              { label: "Bike Owner", path: "/dashboard/vendors/account/parcel/list", icon: "/img/parcel_list.png" },
              { label: "Bike List", path: "/dashboard/vendors/account/parcel", icon: "/img/Parcel_driver.png" },
            ],
          },
        ]
      : []),
  ];

  return (
    <ul className={NAV_UI.topnav.list}>
      {items.map(({ label, path, isSubMenu, subItems, icon }) => (
        <li key={label}>
          {isSubMenu ? (
            <>
              <Button
                variant="text"
                className={submenuToggleClasses}
                onClick={() =>
                  label === "Bike"
                    ? setOpenBikeSubMenu(openBikeSubMenu === label ? "" : label)
                    : setOpenAutoSubMenu(openAutoSubMenu === label ? "" : label)
                }
              >
                <Typography
                  color="inherit"
                  className={NAV_UI.typography.topnavLabel}
                >
                  {label}
                </Typography>
              </Button>
              {(label === "Bike" ? openBikeSubMenu === label : openAutoSubMenu === label) && (
                <ul className={NAV_UI.topnav.nestedList}>
                  {subItems.map(({ label: subLabel, path: subPath, icon: subIcon }) => (
                    <li key={subLabel}>
                      <NavLink to={subPath} end={false}>
                        {({ isActive }) => (
                          <Button
                            variant="text"
                            className={getItemClasses(isActive)}
                          >
                            <Typography
                              color="inherit"
                              className={NAV_UI.typography.topnavLabel}
                            >
                              {subLabel}
                            </Typography>
                          </Button>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
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
          )}
        </li>
      ))}
    </ul>
  );
}

export default VendorsSubmenu;
