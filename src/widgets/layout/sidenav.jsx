import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Spinner
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  TruckIcon,
  IdentificationIcon,
  UserCircleIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const menuItems = [
  { name: "Home", path: "/dashboard/booking", permission: "Home", end: true },
  { name: "All Bookings", path: "/dashboard/booking/list", permission: "All bookings" },
  { name: "Customers", path: "/dashboard/customers", permission: "Customers" },
  { name: "Vendors", path: "/dashboard/vendors/account", permission: "Vendors" },
  { name: "Finance", path: "/dashboard/finance/invoice", permission: "Finance" },
  { name: "Document Verification", path: "/dashboard/doc-verification", permission: "Document verification" },
  { name: "Admin", path: "/dashboard/users", permission: "Users" },
  
];

export function Sidenav({ brandImg, brandName, routes }) {
  //const [loading, setLoading] = useState(false);
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const navigate = useNavigate();
  const { logout } = useAuth();
  // new entry
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
    setOpenSubMenu(null);
  }

  const handleSignOut = async (e) => {
    //setLoading(true);
    e.preventDefault();
    const response = await ApiRequestUtils.post(API_ROUTES.USER_LOGOUT);
    await logout();
    //setLoading(false);
    navigate("/auth/sign-in");
  }
  const toggleSubMenu = (subMenu) => {
    setOpenSubMenu((prev) => (prev === subMenu ? null : subMenu));
  };
 
  const [userPermissions, setUserPermissions] = useState(null);
 const [userName, setUserName] = useState("");
  useEffect(() => {
    const dataFromStorage = localStorage.getItem('loggedInUser');
    
    if (dataFromStorage) {
      const user = JSON.parse(dataFromStorage);
      setUserPermissions(user.permission || []);
        setUserName(user?.email || "");
    }
  }, []);

  if (userPermissions === null) {
    return <div>Loading...</div>;
  }
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Spinner className="h-12 w-12" />
  //     </div>
  //   );
  // }

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} 
  ${openSidenav ? "translate-x-0" : "translate-x-0"} 
  fixed inset-y-0 left-0 z-50 my-2 ml-1 h-[calc(100vh-16px)] w-[90vw] max-w-[308px] 
  rounded-xl transition-transform duration-300 
  border border-blue-gray-100`}
    >
      <div className={`relative`}>
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
             <div className="flex items-center gap-2 px-8 pt-6   text-center">
            <img
                src="/img/app_icon.png"
                alt=" ROOT CABS"
                className="h-6 w-6 rounded-full"
              />
              ROOT CABS
              </div>
                <div className="flex items-center gap-1 px-2 text-center pl-16">
                  {/* <img
                src="/img/profile.png"
                alt=" ROOT CABS"
                className="h-8 w-8 rounded-full"
              /> */}
               <p className="text-sm font-semibold pr-12"> {userName}</p>
               </div>
            
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-1 h-[calc(100vh-150px)] overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {menuItems
            .filter(item => userPermissions.includes(item.permission))
            .map(({ name, path, end }) => (
              <li key={name}>
                <NavLink to={path} end={end}>
                  {({ isActive }) => (
                    <Button
                      variant="text"
                      className={`flex items-center gap-3 px-3 capitalize  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                        }`}
                      fullWidth
                      onClick={() => toggleSubMenu(name)}
                    >
                      {name === "Home" ? (
                        <HomeIcon
                          className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                            }`}
                        />
                      ) : null}

                      {name === "All Bookings" ? (
                        <DocumentTextIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      )
                        : (null)}
                      {name === "Customers" ? (

                        <UserGroupIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}

                      {name === "Vendors" ? (
                        <BuildingStorefrontIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}

                      {name === "Finance" ? (
                        <ChartBarIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}

                      {name === "Document Verification" ? (
                        <DocumentCheckIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}

                      {name === "Admin" ? (
                        <UserCircleIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}
                        

                      <Typography color="inherit" className="font-medium capitalize">
                        {name.toLowerCase()}
                      </Typography>

                      {name !== "Home" && (<div className="ml-auto">
                        {isActive ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </div>)}
                    </Button>
                  )}
                </NavLink>

                {name === "All Bookings" && openSubMenu === "All Bookings" && (
                  <ul className="ml-0">
                    {[
                      { label: "All", path: "/dashboard/booking/list" },
                      { label: "Drivers", path: "/dashboard/booking/list/actingDriver" },
                      { label: "Rides", path: "/dashboard/booking/list/rides" },
                      { label: "Rentals", path: "/dashboard/booking/list/rentals" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                                {label === "All" && (
                                <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                             {label === "Drivers" && (
                                <img
                                  src="/img/driver.png"
                                  alt="Driver"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Rides" && (
                                <img
                                  src="/img/rides.png"
                                  alt="Rides"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Rentals" && (
                                <img
                                  src="/img/rental.png"
                                  alt="Rentals"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}

                {name === "Customers" && openSubMenu === "Customers" && (
                  <ul className="ml-0">
                    {[
                      { label: "All", path: "/dashboard/customers" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                                {label === "All" && (
                                  <div className="space-x-0">
                                      <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-6 w-6 rounded-full"
                                />
                                  </div>
                              
                              )}
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}

                {name === "Vendors" && openSubMenu === "Vendors" && (
                  <ul className="ml-0">
                    {[
                      { label: "Owners", path: "/dashboard/vendors/account" },
                      { label: "Acting Driver", path: "/dashboard/vendors/account/drivers" },
                      { label: "Parcel Driver", path: "/dashboard/vendors/account/parcel" },
                      { label: "Vehicles", path: "/dashboard/Vendors/vehicleList" },
                      { label: "Online Vehicles List", path: "/dashboard/Vendors/onlineVehiclesList" },
                      { label: "Auto Owner", path: "/dashboard/Vendors/account/autoview" },
                       { label: "Auto List", path: "/dashboard/Vendors/account/autoList" },
                      
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                                {label === "Owners" && (
                                <img
                                  src="/img/owners.png"
                                  alt="Owners"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Acting Driver" && (
                                <img
                                  src="/img/acting_driver.png"
                                  alt="Acting Driver"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Parcel Driver" && (
                                <img
                                  src="/img/Parcel_driver.png"
                                  alt="Acting Driver"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Vehicles" && (
                                <img
                                  src="/img/vehicles.png"
                                  alt="Vehicles"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                 {label === "Online Vehicles List" && (
                                <img
                                  src="/img/vehicleslist.png"
                                  alt="Online Vehicles List"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label ===  "Auto Owner" && (
                                <img
                                  src="/img/auto_owners.png"
                                  alt="Online Vehicles List"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Auto List" && (
                                <img
                                  src="/img/auto.png"
                                  alt="Online Vehicles List"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}

                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
                {name === "Finance" && openSubMenu === "Finance" && (
                  <ul className="ml-0">
                    {[
                    
                      { label: "Invoice", path: "/dashboard/finance/invoice" },
                      { label: "Receipt", path: "/dashboard/finance/receipt" },
                      { label: "Master Subscription", path: "/dashboard/finance/master-subscription" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                               {label === "Invoice" && (
                                <img
                                  src="/img/invoice.png"
                                  alt="Invoice"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Receipt" && (
                                <img
                                  src="/img/recipt.png"
                                  alt="Receipt"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Master Subscription" && (
                                <img
                                  src="/img/subscription.png"
                                  alt="Master Subscription"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}

                {name === "Document Verification" && openSubMenu === "Document Verification" && (
                  <ul className="ml-0">
                    {[
                      { label: "All", path: "/dashboard/doc-verification" },
                      { label: "Pending Documents", path: "/dashboard/doc-verification/pending" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                              {label === "All" && (
                                <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Pending Documents" && (
                                <img
                                  src="/img/pending_doc.png"
                                  alt="Pending Documents"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
            
                {name === "Admin" && openSubMenu === "Admin" && (
                  <ul className="ml-0">
                    {[
                      { label: "Users", path: "/dashboard/users" },
                      { label: "Master Price Table", path: "/dashboard/users/master-price" },
                      { label: "Instant Reward", path: "/dashboard/users/instant-reward" },
                      { label: "All Push Notification", path: "/dashboard/vendors/notificationList" },
                      { label: "Drivers App Notification", path: "/dashboard/vendors/driverNotificationList" },
                      { label: "GeoMarkings", path: "/dashboard/admin/geo-markings" },
                       { label: "Version Control", path: "/dashboard/user/versionControlList" },
                      { label: "Discount Module", path: "/dashboard/user/discountModuleList" },
                      { label: "TAX", path: "/dashboard/user/GSTList" },
                       { label: "Banner Image", path: "/dashboard/user/bannerimgView" },
                       { label: "Testimonial", path: "/dashboard/user/testimonialView" },
                       
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-blue-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                                }`}
                              fullWidth
                            >
                              {label === "Users" && (
                                <img
                                  src="/img/user.png"
                                  alt="Users"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Master Price Table" && (
                                <img
                                  src="/img/master_price.png"
                                  alt="Master Price"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Instant Reward" && (
                                <img
                                  src="/img/reward.png"
                                  alt="Instant Reward"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "All Push Notification" && (
                                <img
                                  src="/img/push_notification.png"
                                  alt="All Push Notification"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Drivers App Notification" && (
                                <img
                                  src="/img/driver_app_notification.png"
                                  alt="Drivers App Notification"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "GeoMarkings" && (
                                <img
                                  src="/img/geo_marking.png"
                                  alt="GeoMarkings"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Version Control" && (
                                <img
                                  src="/img/version_control.png"
                                  alt="Version Control"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Discount Module" && (
                                <img
                                  src="/img/discount.png"
                                  alt="Version Control"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "TAX" && (
                                <img
                                  src="/img/gst.png"
                                  alt="TAX"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                                {label === "Banner Image" && (
                                <img
                                  src="/img/banner_img.png"
                                  alt="Banner Image"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                              {label === "Testimonial" && (
                                <img
                                  src="/img/testimonial.png"
                                  alt="Testimonials Image"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </div>
      <Link
        to="/auth/sign-in"
        className="flex items-center bg-red-900 text-white gap-2 p-3 rounded-lg absolute bottom-4 ml-3 hover:bg-gray-900"
        onClick={handleSignOut}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
        Sign Out
      </Link>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Material Tailwind React",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
