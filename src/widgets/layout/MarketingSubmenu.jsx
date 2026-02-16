import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";

function MarketingSubmenu({ miniSidenav }) {
  const [openNotificationSubMenu, setOpenNotificationSubMenu] = useState("");
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const isMainItemActive = (label, path) => {
    const target = path.toLowerCase();

    if (label === "Banner Image") {
      return (
        pathname.startsWith("/dashboard/user/bannerimgview") ||
        pathname.startsWith("/dashboard/user/bannerimg/add")
      );
    }

    if (label === "Testimonial") {
      return (
        pathname.startsWith("/dashboard/user/testimonialview") ||
        pathname.startsWith("/dashboard/user/testimonial/add")
      );
    }

    return pathname.startsWith(target);
  };

  const items = [
    
    
        { label: "Push Notification", path: "/dashboard/vendors/notificationList", icon: "/img/push_notification.png" },
        { label: "Customer App", path: "/dashboard/vendors/customerNotificationList", icon: "/img/customerNotification.png" },
        { label: "Driver App", path: "/dashboard/vendors/driverNotificationList", icon: "/img/driver_app_notification.png" },
  
    { label: "Banner Image", path: "/dashboard/user/bannerimgView", icon: "/img/banner_img.png" },
    { label: "Testimonial", path: "/dashboard/user/testimonialView", icon: "/img/testimonial.png" },
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
                  setOpenNotificationSubMenu(
                    openNotificationSubMenu === label ? "" : label
                  )
                }
              >
                <Typography
                  color="inherit"
                  className="font-medium px-3 capitalize tracking-normal"
                >
                  {label}
                </Typography>
              </Button>
              {openNotificationSubMenu === label && (
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

export default MarketingSubmenu;
