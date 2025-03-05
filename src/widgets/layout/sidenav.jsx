import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";

const menuItems = [
  { name: "Home", path: "/dashboard/booking", permission: "Home" ,end : true },
  { name: "All Bookings", path: "/dashboard/booking/list", permission: "All bookings" },
  { name: "Customers", path: "/dashboard/customers", permission: "Customers" },
  { name: "Vendors", path: "/dashboard/vendors/account", permission: "Vendors" },
  { name: "Finance", path: "/dashboard/finance", permission: "Finance" },
  { name: "Document Verification", path: "/dashboard/doc-verification", permission: "Document verification" },
  { name: "Admin Users", path: "/dashboard/users", permission: "Users" },
];

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userPermissions, setUserPermissions] = useState(null);

  useEffect(() => {
    const dataFromStorage = localStorage.getItem('loggedInUser');
    if (dataFromStorage) {
      const user = JSON.parse(dataFromStorage);
      setUserPermissions(user.permission || []);
    }
  }, []); 

  if (userPermissions === null) {
    return <div>Loading...</div>;
  }

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className={`relative`}>
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
      <div className="m-4 h-[calc(100vh-150px)] overflow-y-auto">
        <ul className="flex flex-col gap-1">
        {menuItems
            .filter(item => userPermissions.includes(item.permission))
            .map(({ name, path, end }) => (
              <li key={name}>
                <NavLink to={path} end={end ? end : false}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      <Typography color="inherit" className="font-medium capitalize">
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
      <Link
        to="/auth/sign-in"
        className="flex items-center bg-black text-white gap-2 p-3 rounded-lg absolute bottom-4 ml-3 hover:bg-gray-700"
        onClick={() => logout()}
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