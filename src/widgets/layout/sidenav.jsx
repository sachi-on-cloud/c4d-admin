import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Spinner,
  Tooltip,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav, setMiniSidenav } from "@/context";
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
  MegaphoneIcon,
} from '@heroicons/react/24/solid';
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const menuItems = [
  { name: "Home", path: "/dashboard/booking", permission: "Home", end: true },
  { name: "All Bookings", path: "/dashboard/booking/list", permission: "All bookings" },
  { name: "Customers", path: "/dashboard/customers", permission: "Customers" },
  { name: "Vendors", path: "/dashboard/vendors/account", permission: "Vendors" },
  { name: "Trip Master", path: "/dashboard/tripDetails", permission: "Trip Master" },
  { name: "Finance", path: "/dashboard/finance/invoice", permission: "Finance" },
  { name: "Document Verification", path: "/dashboard/doc-verification", permission: "Document verification" },
  { name: "Marketing", path:"/dashboard/vendors/notificationList", permission: "Marketing" },
  { name: "Admin", path: "/dashboard/users", permission: "Users" },
];

export function Sidenav({ brandImg, brandName, routes }) {
  //const [loading, setLoading] = useState(false);
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, miniSidenav } = controller;
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

  const getPermissions = async () => {
    try{
      const user = localStorage.getItem('loggedInUser');
      const userId = JSON.parse(user);
      const perm = await ApiRequestUtils.get(API_ROUTES.GET_USER_BY_ID + userId?.id);
      if(perm?.success){
        setUserName(perm?.data?.email || "");
        setUserPermissions(perm?.data?.permission);
      }
    }catch(err){
      console.log("ERROR IN GET PERMISIIONS", err);
    }
  };
   
   
  useEffect(() => {
    getPermissions();
    // const dataFromStorage = localStorage.getItem('loggedInUser');
    
    // if (dataFromStorage) {
    //   const user = JSON.parse(dataFromStorage);
    //   setUserPermissions(user.permission || []);
    //     setUserName(user?.email || "");
    // }
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
      id="app-sidenav"
      className={`${sidenavTypes[sidenavType]} 
  ${openSidenav ? "translate-x-0" : "-translate-x-full"} 
  lg:translate-x-0 fixed inset-y-0 left-0 z-50 my-2 ml-1 h-[calc(100vh-16px)] ${miniSidenav ? 'w-[4.5rem]' : 'w-[90vw] lg:w-[18rem] max-w-[308px]'}
  rounded-xl transition-transform duration-300 
  border border-blue-gray-100`}
    >
      <div className={`relative`}>
        <Link to="/" className={`py-6 ${miniSidenav ? 'px-0' : 'px-6'} text-center transition-all duration-300`}>
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {miniSidenav ? (
              <div className="flex items-center justify-center pt-4">
                <img src="/img/app_icon.png" alt="ROOT CABS" className="h-10 w-10 rounded-full ring-4 ring-primary-200 shadow-lg" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 px-4 pt-3">
                  <img src="/img/app_icon.png" alt="ROOT CABS" className="h-10 w-10 rounded-full ring-4 ring-primary-200 shadow-lg" />
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold tracking-wide">ROOT CABS</span>
                    <span className="text-sm text-blue-gray-600 font-medium">{userName}</span>
                  </div>
                </div>
              </>
            )}
            
          </Typography>
        </Link>
        {/* Collapse toggle (desktop) */}
        <div className="absolute -right-3 top-6 hidden lg:block">
          <IconButton
            size="sm"
            variant="text"
            color="blue-gray"
            className="rounded-full bg-white shadow-sm border border-blue-gray-100"
            onClick={() => setMiniSidenav(dispatch, !miniSidenav)}
            aria-label={miniSidenav ? "Expand sidebar" : "Collapse sidebar"}
          >
            {miniSidenav ? (
              <span className="inline-block rotate-180 text-lg">›</span>
            ) : (
              <span className="inline-block text-lg">›</span>
            )}
          </IconButton>
        </div>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none lg:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className={`m-1 h-[calc(100vh-150px)] overflow-y-auto ${miniSidenav ? 'px-0' : ''}`}>
        <ul className="flex flex-col gap-2">
          {menuItems
            .filter(item => userPermissions.includes(item.permission))
            .map(({ name, path, end }) => (
              <li key={name} className="group">
                <NavLink to={path} end={end} className="block">
                  {({ isActive }) => (
                    <Button
                      size="sm"
                      variant="text"
                      className={`group flex items-center gap-4 ${miniSidenav ? 'justify-center px-0 py-3' : 'px-4 py-3'} capitalize rounded-xl transition-all duration-200 ease-in-out
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]' 
                          : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 text-gray-700 hover:shadow-md hover:transform hover:scale-[1.01]'
                        } ${miniSidenav ? 'w-12 h-12' : 'w-full'}`}
                      fullWidth
                      onClick={() => toggleSubMenu(name)}
                    >
                      {name === "Home" ? (
                        <HomeIcon
                          className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200`}
                        />
                      ) : null}

                      {name === "All Bookings" ? (
                        <DocumentTextIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      )
                        : (null)}
                      {name === "Customers" ? (

                        <UserGroupIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}

                      {name === "Vendors" ? (
                        <BuildingStorefrontIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}
                       {name === "Trip Master" ? (
                        <BuildingStorefrontIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}


                      {name === "Finance" ? (
                        <ChartBarIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}

                      {name === "Document Verification" ? (
                        <DocumentCheckIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}
                      {name === "Marketing" ? (
                        <MegaphoneIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}

                      {name === "Admin" ? (
                        <UserCircleIcon className={`h-7 w-7 ${miniSidenav ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-colors duration-200 ${isActive ? 'bg-white/20' : ''} rounded-lg p-1`} />
                      ) : null}

                      {!miniSidenav && (
                        <Typography color="inherit" className={`font-semibold capitalize tracking-wide ${miniSidenav ? 'hidden' : 'block'} ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary-700'} transition-colors duration-200`}>
                        {name.toLowerCase()}
                      </Typography>
                      )}
                      {miniSidenav && (
                        <Tooltip content={name} placement="right">
                          <span className="sr-only">{name}</span>
                        </Tooltip>
                      )}

                      {!miniSidenav && name !== "Home" && (
                        <div className={`ml-auto transition-transform duration-200 ${openSubMenu === name ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon className={`w-5 h-5 ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-primary-600'} transition-colors duration-200`} />
                        </div>
                      )}
                    </Button>
                  )}
                </NavLink>

                {!miniSidenav && name === "All Bookings" && openSubMenu === "All Bookings" && (
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
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
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                                {label === "All" && (
                                <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                             {label === "Drivers" && (
                                <img
                                  src="/img/driver.png"
                                  alt="Driver"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Rides" && (
                                <img
                                  src="/img/rides.png"
                                  alt="Rides"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Rentals" && (
                                <img
                                  src="/img/rental.png"
                                  alt="Rentals"
                                  className="h-4 w-4 rounded-full "
                                />
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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

                {!miniSidenav && name === "Customers" && openSubMenu === "Customers" && (
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "All", path: "/dashboard/customers" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                                {label === "All" && (
                                  <div className="space-x-0">
                                      <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-4 w-4 rounded-full"
                                />
                                  </div>
                              
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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

                {!miniSidenav && name === "Vendors" && openSubMenu === "Vendors" && (
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "Owners", path: "/dashboard/vendors/account" },
                      { label: "Acting Driver", path: "/dashboard/vendors/account/drivers" },
                      { label: "Vehicles", path: "/dashboard/Vendors/vehicleList" },
                      { label: "Online Vehicles List", path: "/dashboard/Vendors/onlineVehiclesList" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                                {label === "Owners" && (
                                <img
                                  src="/img/owners.png"
                                  alt="Owners"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                {label === "Acting Driver" && (
                                <img
                                  src="/img/acting_driver.png"
                                  alt="Acting Driver"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                {label === "Vehicles" && (
                                <img
                                  src="/img/vehicles.png"
                                  alt="Vehicles"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                 {label === "Online Vehicles List" && (
                                <img
                                  src="/img/vehicleslist.png"
                                  alt="Online Vehicles List"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}

                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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
                {!miniSidenav && name === "Trip Master" && openSubMenu === "Trip Master" && (
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "Details", path: "/dashboard/tripDetails" },
                      { label: "Reports", path: "/dashboard/tripDetails/reports" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                              {label === "Details"  }
                               {label === "Reports" 
                                // <img
                                //   src="/img/pending_doc.png"
                                //   alt="Pending Documents"
                                //   className="h-4 w-4 rounded-full"
                                // />
                              }
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
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
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                               {label === "Invoice" && (
                                <img
                                  src="/img/invoice.png"
                                  alt="Invoice"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                {label === "Receipt" && (
                                <img
                                  src="/img/recipt.png"
                                  alt="Receipt"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                {label === "Master Subscription" && (
                                <img
                                  src="/img/subscription.png"
                                  alt="Master Subscription"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "All", path: "/dashboard/doc-verification" },
                      { label: "Pending Documents", path: "/dashboard/doc-verification/pending" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                              {label === "All" && (
                                <img
                                  src="/img/all.png"
                                  alt="All"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Pending Documents" && (
                                <img
                                  src="/img/pending_doc.png"
                                  alt="Pending Documents"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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

                {name === "Marketing" && openSubMenu === "Marketing" && (
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "All Push Notification", path: "/dashboard/vendors/notificationList" },
                      { label: "Drivers App Notification", path: "/dashboard/vendors/driverNotificationList" },
                      { label: "Banner Image", path: "/dashboard/user/bannerimgView" },
                      { label: "Testimonial", path: "/dashboard/user/testimonialView" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                              {label === "All Push Notification" && (
                                <img
                                  src="/img/push_notification.png"
                                  alt="All Push Notification"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                {label === "Drivers App Notification" && (
                                <img
                                  src="/img/driver_app_notification.png"
                                  alt="Drivers App Notification"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              {label === "Banner Image" && (
                                <img
                                  src="/img/banner_img.png"
                                  alt="Banner Image"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              {label === "Testimonial" && (
                                <img
                                  src="/img/testimonial.png"
                                  alt="Testimonials Image"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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
                  <ul className="ml-6 mt-2 flex flex-col gap-1">
                    {[
                      { label: "Users", path: "/dashboard/users" },
                      { label: "Master Price Table", path: "/dashboard/users/master-price" },
                      { label: "Instant Reward", path: "/dashboard/users/instant-reward" },
                      { label: "GeoMarkings", path: "/dashboard/admin/geo-markings" },
                       { label: "Version Control", path: "/dashboard/user/versionControlList" },
                      { label: "Discount Module", path: "/dashboard/user/discountModuleList" },
                      { label: "TAX", path: "/dashboard/user/GSTList" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-3 ${miniSidenav ? 'justify-center px-0 py-2' : 'px-4 py-2'} rounded-lg capitalize transition-all duration-200 ease-in-out
                                ${isActive 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:shadow-sm'
                                } ${miniSidenav ? 'w-10 h-10' : 'w-full'}`}
                              fullWidth
                            >
                              {label === "Users" && (
                                <img
                                  src="/img/user.png"
                                  alt="Users"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Master Price Table" && (
                                <img
                                  src="/img/master_price.png"
                                  alt="Master Price"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Instant Reward" && (
                                <img
                                  src="/img/reward.png"
                                  alt="Instant Reward"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                                                      
                               {label === "GeoMarkings" && (
                                <img
                                  src="/img/geo_marking.png"
                                  alt="GeoMarkings"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Version Control" && (
                                <img
                                  src="/img/version_control.png"
                                  alt="Version Control"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "Discount Module" && (
                                <img
                                  src="/img/discount.png"
                                  alt="Version Control"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                               {label === "TAX" && (
                                <img
                                  src="/img/gst.png"
                                  alt="TAX"
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <Typography
                                size='sm'
                                color="inherit"
                                className={`font-medium capitalize ${isActive ? 'text-white' : 'text-gray-700'} transition-colors duration-200`}
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
        className={`absolute bottom-4 ${miniSidenav ? 'left-1/2 -translate-x-1/2' : 'ml-3'} `}
        onClick={handleSignOut}
      >
        {miniSidenav ? (
          <Tooltip content="Sign out" placement="right">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3.75 4.5A2.25 2.25 0 016 2.25h6A2.25 2.25 0 0114.25 4.5v3a.75.75 0 01-1.5 0v-3a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v15a.75.75 0 00.75.75h6a.75.75 0 00.75-.75v-3a.75.75 0 011.5 0v3A2.25 2.25 0 0112 21.75H6A2.25 2.25 0 013.75 19.5v-15z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M16.28 8.22a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h8.5l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </span>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-2 hover:bg-red-100 border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3.75 4.5A2.25 2.25 0 016 2.25h6A2.25 2.25 0 0114.25 4.5v3a.75.75 0 01-1.5 0v-3a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v15a.75.75 0 00.75.75h6a.75.75 0 00.75-.75v-3a.75.75 0 011.5 0v3A2.25 2.25 0 0112 21.75H6A2.25 2.25 0 013.75 19.5v-15z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M16.28 8.22a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h8.5l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Sign out</span>
          </div>
        )}
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
