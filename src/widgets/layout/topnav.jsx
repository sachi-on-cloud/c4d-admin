import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";

export function Topnav({ brandImg, brandName, routes }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-xl font-semibold">
            C4D ADMIN
            {/* <img src={brandImg} alt={brandName} className="h-8" /> */}
          </Link>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-gray-700 text-white"
                containerProps={{
                  className: "min-w-[200px]",
                }}
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Menu>
              <MenuHandler>
                <IconButton variant="text" color="white">
                  <UserCircleIcon className="h-6 w-6" />
                </IconButton>
              </MenuHandler>
              <MenuList className="bg-gray-700">
                <MenuItem className="text-white hover:bg-gray-600">
                  <Link to="/profile" className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4" />
                    Profile
                  </Link>
                </MenuItem>
                <MenuItem className="text-white hover:bg-gray-600">
                  <Link to="/edit-profile" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit Profile
                  </Link>
                </MenuItem>
                <MenuItem className="text-white hover:bg-gray-600">
                  <Link to="/signout" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                  </Link>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
        
        <nav>
          <div className="hidden md:flex items-center space-x-4">
            {routes.map(({ layout, pages }, key) => (
              pages.map(({ icon, name, path, display }) => (
                <>
                    { display && (
                        <NavLink 
                        key={name} 
                        to={`/${layout}${path}`}
                        className={({ isActive }) => 
                            isActive 
                            ? "text-white font-medium border-b border-white py-3 px-6" 
                            : "text-gray-600 hover:text-gray-300"
                        }
                        >
                        <span className="flex items-center gap-2">
                            {icon}
                            <Typography className="font-medium capitalize">
                            {name}
                            </Typography>
                        </span>
                        </NavLink>

                    )}
                </>
              ))
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

Topnav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Material Tailwind React",
};

Topnav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Topnav.displayName = "/src/widgets/layout/topnav.jsx";

export default Topnav;