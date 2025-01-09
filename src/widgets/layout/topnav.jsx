import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";

export function Topnav({ sidenavColor, sidenavType = "dark" }) {
  const [currentSubmenu, setCurrentSubmenu] = useState(null);
  const location = useLocation();

  // Define submenu structure matching sidenav
  const submenus = {
    "/dashboard/booking/list": [
      { path: "/dashboard/booking/list", label: "All" },
      { path: "/dashboard/booking/list/actingDriver", label: "Acting Drivers" },
      { path: "/dashboard/booking/list/cabBooking", label: "Cab Booking" },
      { path: "/dashboard/booking/list/carWash", label: "Car Wash" }
    ],
    "/dashboard/customers": [
      { path: "/dashboard/customers", label: "All" }
    ],
    "/dashboard/vendors/account": [
      { path: "/dashboard/vendors/account", label: "Cab Owners" },
      { path: "/dashboard/vendors/drivers", label: "Drivers" },
      { path: "/dashboard/vendors/allVehicles", label: "All Vehicles" }
    ],
    "/dashboard/finance": [
      { path: "/dashboard/finance", label: "All Payments" },
      { path: "/dashboard/finance/cab-subscription", label: "Cab Subscription" },
      { path: "/dashboard/finance/payable", label: "Payable" },
      { path: "/dashboard/finance/receivables", label: "Receivables" }
    ],
    "/dashboard/doc-verification": [
      { path: "/dashboard/doc-verification", label: "All" },
      { path: "/dashboard/doc-verification/pending", label: "Pending Documents" }
    ]
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
      <div className="flex items-center gap-4 px-4 py-2">
        {currentSubmenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split("/").length <= 4}
          >
            {({ isActive }) => (
              <Button
                variant={isActive ? "gradient" : "text"}
                color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                className="flex items-center gap-4 px-4 capitalize"
                size="sm"
              >
                <Typography
                  color="inherit"
                  className="font-medium capitalize"
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