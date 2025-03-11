import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";

export function Topnav({ sidenavColor, sidenavType = "dark" }) {
  const [currentSubmenu, setCurrentSubmenu] = useState(null);
  const location = useLocation();

  // Define submenu structure matching sidenav
  const submenus = {
    "/dashboard/booking/list": [
      { path: "/dashboard/booking/list", label: "All", end: true },
      { path: "/dashboard/booking/list/actingDriver", label: "Drivers" },
      { path: "/dashboard/booking/list/rides", label: "Rides" },
      { path: "/dashboard/booking/list/rentals", label: "Rentals" },
      // { path: "/dashboard/booking/list/cabBooking", label: "Cab Booking" },
      // { path: "/dashboard/booking/list/carWash", label: "Car Wash" }
    ],
    "/dashboard/customers": [
      { path: "/dashboard/customers", label: "All", end: true }
    ],
    "/dashboard/vendors/account": [
      { path: "/dashboard/vendors/account", label: "Owners", end: true },
      { path: "/dashboard/vendors/account/drivers", label: "Drivers Only" },
      // { path: "/dashboard/vendors/account/allVehicles", label: "All Vehicles" }
    ],
    "/dashboard/finance": [
      { path: "/dashboard/finance", label: "All Payments", end: true },
      // { path: "/dashboard/finance/cab-subscription", label: "Cab Subscription" },
      // { path: "/dashboard/finance/payable", label: "Payable" },
      // { path: "/dashboard/finance/receivables", label: "Receivables" },
      { path: "/dashboard/finance/invoice", label: "Invoice" },
      { path: "/dashboard/finance/receipt", label: "Receipt" },
      { path: "/dashboard/finance/master-subscription", label: "Master Subscription" },
    ],
    "/dashboard/doc-verification": [
      { path: "/dashboard/doc-verification", label: "All", end: true },
      { path: "/dashboard/doc-verification/pending", label: "Pending Documents" }
    ],
    "/dashboard/users": [
      { path: "/dashboard/users", label: "Users", end: true },
      { path: "/dashboard/users/master-price", label: "Master Price Table" },
    ],
  };

  // Function to determine which submenu to show based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingSubmenuKey = Object.keys(submenus).find(key =>
      currentPath.startsWith(key)
    );
    setCurrentSubmenu(matchingSubmenuKey ? submenus[matchingSubmenuKey] : null);
  }, [location.pathname]);

  // If no submenu is available, don't render the topnav
  if (!currentSubmenu) {
    return null;
  }

  return (
    // <div className="bg-white shadow-sm m-4">
    <div className="flex items-center gap-7 px-5 py-3 mt-4 ml-6 rounded-xl border border-blue-gray-100 bg-white">
      {currentSubmenu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path.split("/").length <= 4 && item.end ? item.end : false}
        >
          {({ isActive }) => (
            <Button
              variant={isActive ? "gradient" : "text"}
              color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
              className="flex items-center gap-4 px-4 capitalize rounded-2xl"
              size="md"
            >
              <Typography
                color="inherit"
                className="font-medium capitalize text-lg"
              >
                {item.label}
              </Typography>
            </Button>
          )}
        </NavLink>
      ))}
    </div>
    // </div>
  );
}

Topnav.displayName = "/src/widgets/layout/topnav.jsx";

export default Topnav;