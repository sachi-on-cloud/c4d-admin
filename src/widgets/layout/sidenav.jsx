import PropTypes from "prop-types";
import { Link, NavLink,useNavigate} from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import React, { useState } from "react";
import { useAuth } from "@/context/auth";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null); 
  const navigate = useNavigate();
  const { logout } = useAuth();
  

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (subMenu) => {
    setOpenSubMenu((prev) => (prev === subMenu ? null : subMenu));
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div
        className={`relative`}
      >
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            C4D ADMIN
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
      {/* <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path, display }) => (
              <>
                {display && (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={
                            isActive
                              ? sidenavColor
                              : sidenavType === "dark"
                                ? "white"
                                : "blue-gray"
                          }
                          className="flex items-center gap-4 px-4 capitalize"
                          fullWidth
                        >
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>)
                }
              </>
            ))}
          </ul>
        ))}
      </div> */}
      <div className="m-4">
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to={`/dashboard/booking`} end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={()=>{toggleMenu("home")}}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Home
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          <li>
          <NavLink to={`/dashboard/booking/list`}>
            {({ isActive }) => (
              <Button
                variant={isActive ? "gradient" : "text"}
                color={
                  isActive
                    ? sidenavColor
                    : sidenavType === "dark"
                      ? "white"
                      : "blue-gray"
                }
                className="flex items-center gap-4 px-4 capitalize"
                fullWidth
                onClick={()=>{toggleSubMenu("allBookings")}}
              >
                <Typography
                  color="inherit"
                  className="font-medium capitalize"
                >
                  All Bookings
                </Typography>
              </Button>
            )}
          </NavLink>
          </li>
          {openSubMenu === 'allBookings' && (<ul className="mb-4 ml-4 flex flex-col gap-1">
            <li>
              <NavLink to={`/dashboard/booking/list`} end>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      All
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/booking/list/actingDriver`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Acting Drivers
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/booking/list/cabBooking`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Cab Booking
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/booking/list/carWash`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Car Wash
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
          </ul>)}
          <li>
            <NavLink to={`/dashboard/customers`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("customers")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Customers
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          {openSubMenu === 'customers' && (<ul className="mb-4 ml-4 flex flex-col gap-1">
            <li>
              <NavLink to={`/dashboard/customers`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      All
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
          </ul>)}
          <li>
            <NavLink to={`/dashboard/vendors/account`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("vendors")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Vendors
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          {openSubMenu === 'vendors' && (<ul className="mb-4 ml-4 flex flex-col gap-1">
            <li>
              <NavLink to={`/dashboard/vendors/account`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Cab Owners
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/vendors/drivers`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Drivers
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/vendors/allVehicles`} end>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      All Vehicles
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
          </ul>)}
          <li>
            <NavLink to={`/dashboard/finance`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("finance")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Finance
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          {openSubMenu === 'finance' && (<ul className="mb-4 ml-4 flex flex-col gap-1">
            <li>
              <NavLink to={`/dashboard/finance`} end>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      All Payments
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/finance/cabSubscription`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Cab Subscription
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/finance/payable`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Payable
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/finance/receivables`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Receivables
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
          </ul>)}
          <li>
            <NavLink to={`/dashboard/doc-verification`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("docVerification")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Document Verification
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          {openSubMenu === 'docVerification' && (<ul className="mb-4 ml-4 flex flex-col gap-1">
            <li>
              <NavLink to={`/dashboard/doc-verification`} end>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      All
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/dashboard/doc-verification/pending`}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={
                      isActive
                        ? sidenavColor
                        : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    <Typography
                      color="inherit"
                      className="font-medium capitalize"
                    >
                      Pending Documents
                    </Typography>
                  </Button>
                )}
              </NavLink>
            </li>
          </ul>)}
          <li>
            <NavLink to={`/dashboard/online-registration`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("onlineRegistration")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Online Registration
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to={`/dashboard/users`}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "gradient" : "text"}
                  color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                        ? "white"
                        : "blue-gray"
                  }
                  className="flex items-center gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => toggleSubMenu("adminUsers")}
                >
                  <Typography
                    color="inherit"
                    className="font-medium capitalize"
                  >
                    Admin Users
                  </Typography>
                </Button>
              )}
            </NavLink>
          </li>
        </ul>
      </div>
      <Link to="/auth/sign-in" className="flex items-center bg-black text-white gap-2 p-3 rounded-lg absolute bottom-4 ml-3 hover:bg-gray-700" onClick={() => logout()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
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
