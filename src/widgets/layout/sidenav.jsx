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
  ShoppingBagIcon,
} from '@heroicons/react/24/solid';
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";

const menuItems = [
  { name: "Home", path: "/dashboard/booking", permission: "Home", end: true },
  { name: "Calls", path: "/dashboard/users/exotel-calls/list", permission: "Calls"},
  { name: "All Bookings", path: "/dashboard/booking/list", permission: "All bookings" },
  { name: "Customers", path: "/dashboard/customers", permission: "Customers" },
  { name: "Vendors", path: "/dashboard/vendors/account", permission: "Vendors" },
  { name: "Inventory", path: "/dashboard/inventory/category-list", permission: "Inventory" },
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
  const [openBikeSubMenu, setOpenBikeSubMenu] = useState("");  
  const [openAutoSubMenu, setOpenAutoSubMenu] = useState("");
  const [openNotificationSubMenu, setOpenNotificationSubMenu] = useState("");

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
        <Link to="/" className={`py-5 ${miniSidenav ? 'px-0' : 'px-6'} text-center`}>
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {miniSidenav ? (
              <div className="flex items-center justify-center pt-4">
                <img src="/img/app_icon.png" alt="ROOT CABS" className="h-8 w-8 rounded-full ring-2 ring-primary-200" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 pt-2">
                  <img src="/img/app_icon.png" alt="ROOT CABS" className="h-8 w-8 rounded-full ring-2 ring-primary-200" />
                  <div className="flex flex-col items-start">
                    <span className="text-base font-semibold tracking-wide">ROOT CABS</span>
                    <span className="text-xs text-blue-gray-500">{userName}</span>
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
        <ul className="flex flex-col gap-1">
          {menuItems
            .filter(item => userPermissions.includes(item.permission))
            .map(({ name, path, end }) => (
              <li key={name}>
                <NavLink to={path} end={end}>
                  {({ isActive }) => (
                    <Button
                      variant="text"
                      className={`group flex items-center gap-3 ${miniSidenav ? 'justify-center px-0' : 'px-3'} capitalize rounded-xl 
                        ${isActive ? 'bg-primary-100 text-black' : 'hover:bg-primary-50'} `}
                      fullWidth
                      onClick={() => toggleSubMenu(name)}
                    >
                      {name === "Home" ? (
                        <HomeIcon
                          className={`h-6 w-6 text-black`}
                        />
                      ) : null}

                      {name === "Calls" && (
                        <img
                          src="/img/calls.png"
                          alt="Calls"
                          className="h-6 w-6 rounded-full"
                        />
                      )}

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
                      { name === "Inventory" ? (
                         <ShoppingBagIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}
                       {name === "Trip Master" ? (
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
                      {name === "Marketing" ? (
                        <MegaphoneIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}

                      {name === "Admin" ? (
                        <UserCircleIcon className={`h-6 w-6 rounded-sm text-black ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
                          }`} />
                      ) : null}
                        

                      {!miniSidenav && (
                        <Typography color="inherit" className="font-medium capitalize">
                          {name.toLowerCase()}
                        </Typography>
                      )}
                      {miniSidenav && (
                        <Tooltip content={name} placement="right">
                          <span className="sr-only">{name}</span>
                        </Tooltip>
                      )}

                      {!miniSidenav && name !== "Home" && name !== 'Calls' && (
                        <div className="ml-auto">
                          {isActive ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </Button>
                  )}
                </NavLink>

                {!miniSidenav && name === "All Bookings" && openSubMenu === "All Bookings" && (
                  <ul className="ml-0">
                    {[
                      { label: "All", path: "/dashboard/booking/list" },
                      { label: "Drivers", path: "/dashboard/booking/list/actingDriver" },
                      { label: "Rides", path: "/dashboard/booking/list/rides" },
                      { label: "Rentals", path: "/dashboard/booking/list/rentals" },
                      { label: "Auto", path:"/dashboard/booking/list/Auto"},
                      { label: "Parcel", path:"/dashboard/booking/list/Parcel"}
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1  ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'}
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
                                 {label === "Auto" && (
                                <img
                                  src="/img/auto.png"
                                  alt="Auto List"
                                  className="h-6 w-6 rounded-full"
                                />
                              )}
                               {label === "Parcel" && (
                                <img
                                  src="/img/Parcel_driver.png"
                                  alt="Bike List"
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

                {!miniSidenav && name === "Customers" && openSubMenu === "Customers" && (
                  <ul className="ml-0">
                    {[
                      { label: "All", path: "/dashboard/customers" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1  ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'}
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

                {!miniSidenav && name === "Vendors" && openSubMenu === "Vendors" && (
                  <ul className="ml-0">
                    {[
                      { label: "Owners", path: "/dashboard/vendors/account" },
                      { label: "Acting Driver", path: "/dashboard/vendors/account/drivers" },
                      { label: "Vehicles", path: "/dashboard/Vendors/vehicleList" },
                      { label: "Online Vehicles List", path: "/dashboard/Vendors/onlineVehiclesList" },
                      {
                        label: "Bike",
                        isSubMenu: true,
                        subItems: [
                          { label: "Bike Owner", path:"/dashboard/vendors/account/parcel/list" },
                          { label: "Bike List", path: "/dashboard/vendors/account/parcel" },
                        ],
                      },
                      {
                        label: "Auto",
                        isSubMenu: true,
                        subItems: [
                      { label: "Auto Owner", path: "/dashboard/Vendors/account/autoview" },
                       { label: "Auto List", path: "/dashboard/Vendors/account/autoList" },
                        ],
                      },
                    ].map(({ label, path, isSubMenu, subItems }) => (
                      <li key={label}>
                        {isSubMenu ? (
                          <>
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1 hover:bg-primary-50`}
                              fullWidth
                              onClick={() =>
                                label === "Bike"
                                  ? setOpenBikeSubMenu(openBikeSubMenu === label ? "" : label)
                                  : setOpenAutoSubMenu(openAutoSubMenu === label ? "" : label)
                              } 
                            >
                              <img
                                src={label === "Bike" ? "/img/multiple_bike.jpg" : "/img/auto.png"}
                                alt={label}
                                className="h-6 w-6 rounded-full"
                              />
                              <Typography color="inherit" className="font-medium px-3 capitalize">
                                {label}
                              </Typography>
                            </Button>
                            {(label === "Bike" ? openBikeSubMenu === label : openAutoSubMenu === label) && (
                              <ul className="ml-4">
                                {subItems.map(({ label: subLabel, path: subPath }) => (
                                  <li key={subLabel}>
                                    <NavLink to={subPath} end>
                                      {({ isActive }) => (
                                        <Button
                                          variant="text"
                                          className={`flex items-center gap-2 ${
                                            miniSidenav ? "justify-center px-0" : "px-8"
                                          } py-2 rounded-lg capitalize mt-1 ${
                                            isActive ? "bg-primary-100" : "hover:bg-primary-50"
                                          }`}
                                          fullWidth
                                        >
                                          {subLabel === "Bike Owner" && (
                                            <img
                                              src="/img/parcel_list.png"
                                              alt="Bike Owner"
                                              className="h-6 w-6 rounded-full"
                                            />
                                          )}
                                          {subLabel === "Bike List" && (
                                            <img
                                              src="/img/Parcel_driver.png"
                                              alt="Bike List"
                                              className="h-6 w-6 rounded-full"
                                            />
                                          )}
                                          {subLabel === "Auto Owner" && (
                                            <img
                                              src="/img/auto_owners.png"
                                              alt="Auto Owner"
                                              className="h-6 w-6 rounded-full"
                                            />
                                          )}
                                          {subLabel === "Auto List" && (
                                            <img
                                              src="/img/auto.png"
                                              alt="Auto List"
                                              className="h-6 w-6 rounded-full"
                                            />
                                          )}
                                          <Typography
                                            color="inherit"
                                            className="font-medium px-3 capitalize"
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
                          <NavLink to={path} end>
                            {({ isActive }) => (
                              <Button
                                variant="text"
                                className={`flex items-center gap-2 ${
                                  miniSidenav ? "justify-center px-0" : "px-8"
                                } py-2 rounded-lg capitalize mt-1 ${
                                  isActive ? "bg-primary-100" : "hover:bg-primary-50"
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
                              <Typography
                                color="inherit"
                                className="font-medium px-3 capitalize"
                              >
                                {label}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {!miniSidenav && name === "Inventory" && openSubMenu === "Inventory" && (
                  <ul className="ml-0">
                    {[
                      { label: "Category", path: "/dashboard/inventory/category-list" },
                      { label: "Product", path: "/dashboard/inventory/product-list" },
                      { label: "Stock", path: "/dashboard/inventory/quantity-list" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1  ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'}
                                }`}
                              fullWidth
                            >
                              {label === "Category"}
                              {label === "Product"}
                              {label === "Stock"}
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
                {!miniSidenav && name === "Trip Master" && openSubMenu === "Trip Master" && (
                  <ul className="ml-0">
                    {[
                      { label: "Details", path: "/dashboard/tripDetails" },
                      { label: "Reports", path: "/dashboard/tripDetails/reports" },
                    ].map(({ label, path }) => (
                      <li key={label}>
                        <NavLink to={path} end>
                          {({ isActive }) => (
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1  ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'}
                                }`}
                              fullWidth
                            >
                              {label === "Details"  }
                               {label === "Reports" 
                                // <img
                                //   src="/img/pending_doc.png"
                                //   alt="Pending Documents"
                                //   className="h-6 w-6 rounded-full"
                                // />
                              }
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
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-primary-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
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
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-primary-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
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

                {name === "Marketing" && openSubMenu === "Marketing" && (
                  <ul className="ml-0">
                    {[
                      { label: "All Push Notification", isSubMenu: true, subItems: [
                        { label: "Push Notification", path: "/dashboard/vendors/notificationList" },
                        { label: "Customer App", path: "/dashboard/vendors/customerNotificationList" },
                        { label: "Driver App", path: "/dashboard/vendors/driverNotificationList" },
                      ] },
                      { label: "Banner Image", path: "/dashboard/user/bannerimgView" },
                      { label: "Testimonial", path: "/dashboard/user/testimonialView" },
                    ].map(({ label, path, isSubMenu, subItems }) => (
                      <li key={label}>
                        {isSubMenu ? (
                          <>
                            <Button
                              variant="text"
                              className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-7'} py-2 rounded-lg capitalize mt-1 hover:bg-primary-50`}
                              fullWidth
                              onClick={() => setOpenNotificationSubMenu(openNotificationSubMenu === label ? "" : label)}
                            >
                              <img src="/img/push_notification.png" alt={label} className="h-6 w-6 rounded-full" />
                              <Typography color="inherit" className="font-medium px-3 capitalize">
                                {label}
                              </Typography>
                            </Button>
                            {openNotificationSubMenu === label && (
                              <ul className="ml-4">
                                {subItems.map(({ label: subLabel, path: subPath }) => (
                                  <li key={subLabel}>
                                    <NavLink to={subPath} end>
                                      {({ isActive }) => (
                                        <Button
                                          variant="text"
                                          className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1 ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'} `}
                                          fullWidth
                                        >
                                          {subLabel === "Push Notification" && (
                                            <img 
                                            src="/img/push_notification.png"
                                             alt="Push Notification"
                                              className="h-6 w-6 rounded-full"
                                               />
                                          )}
                                          {subLabel === "Customer App" && (
                                            <img src="/img/customerNotification.png" alt="Combine Message" className="h-6 w-6 rounded-full" />
                                          )}
                                          {subLabel === "Driver App" && (
                                            <img
                                             src="/img/driver_app_notification.png" 
                                             alt="Drivers App Notification"
                                              className="h-6 w-6 rounded-full" 
                                              />
                                          )}
                                          <Typography color="inherit" className="font-medium px-3 capitalize">
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
                          <NavLink to={path} end>
                            {({ isActive }) => (
                              <Button
                                variant="text"
                                className={`flex items-center gap-2 ${miniSidenav ? 'justify-center px-0' : 'px-8'} py-2 rounded-lg capitalize mt-1 ${isActive ? 'bg-primary-100' : 'hover:bg-primary-50'} `}
                                fullWidth
                              >
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
                        )}
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
                              className={`flex items-center gap-0 px-8 capitalize mt-1  hover:bg-primary-700 ${isActive ? ColorStyles.sidenavColors : "bg-transparent"
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
