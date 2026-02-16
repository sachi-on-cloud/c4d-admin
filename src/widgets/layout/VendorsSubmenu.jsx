import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import { Feature } from "@/utils/constants";

function VendorsSubmenu({ miniSidenav }) {
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
      default:
        return pathname.startsWith(target);
    }
  };

  const items = [
    { label: "Owners", path: "/dashboard/vendors/account", icon: "/img/owners.png" },
    { label: "Acting Driver", path: "/dashboard/vendors/account/drivers", icon: "/img/acting_driver.png" },
    { label: "Vehicles", path: "/dashboard/Vendors/vehicleList", icon: "/img/vehicles.png" },
    { label: "Online Vehicles List", path: "/dashboard/Vendors/onlineVehiclesList", icon: "/img/vehicleslist.png" },
    { label: "Auto Owner", path: "/dashboard/Vendors/account/autoview", icon: "/img/parcel_list.png" },
    { label: "Auto List", path: "/dashboard/Vendors/account/autoList", icon: "/img/auto.png" },
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
    <ul className="flex items-center gap-6  overflow-x-auto whitespace-nowrap">
      {items.map(({ label, path, isSubMenu, subItems, icon }) => (
        <li key={label}>
          {isSubMenu ? (
            <>
              <Button
                variant="text"
                className="flex items-center gap-2 pb-2 px-0 rounded-none bg-transparent text-sm md:text-base capitalize border-b-2 border-transparent text-blue-gray-600 hover:text-primary-600 hover:border-primary-300"
                onClick={() =>
                  label === "Bike"
                    ? setOpenBikeSubMenu(openBikeSubMenu === label ? "" : label)
                    : setOpenAutoSubMenu(openAutoSubMenu === label ? "" : label)
                }
              >
                <Typography
                  color="inherit"
                  className="font-medium px-3 capitalize tracking-normal"
                >
                  {label}
                </Typography>
              </Button>
              {(label === "Bike" ? openBikeSubMenu === label : openAutoSubMenu === label) && (
                <ul className="ml-4">
                  {subItems.map(({ label: subLabel, path: subPath, icon: subIcon }) => (
                    <li key={subLabel}>
                      <NavLink to={subPath} end={false}>
                        {({ isActive }) => (
                          <Button
                            variant="text"
                            className={`flex items-center gap-2 pb-2 px-0 rounded-none bg-transparent text-sm md:text-base capitalize border-b-2 ${
                              isActive
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-blue-gray-600 hover:text-primary-600 hover:border-primary-300"
                            }`}
                          >
                            <Typography
                              color="inherit"
                              className="font-medium px-3 capitalize tracking-normal"
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
                className={`flex items-center gap-2 pb-2 px-0 rounded-none bg-transparent text-sm md:text-base capitalize border-b-2 ${
                  isMainItemActive(label, path)
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
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
}

export default VendorsSubmenu;
