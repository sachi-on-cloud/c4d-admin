import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";

function CustomersSubmenu() {
  return (
    <ul className="flex items-center gap-6  overflow-x-auto whitespace-nowrap">
      {[
        { label: "All", path: "/dashboard/customers", icon: "/img/all.png" },
      ].map(({ label, path, icon }) => (
        <li key={label}>
          <NavLink to={path} end={false}>
            {({ isActive }) => (
              <Button
                variant="text"
                className={`flex items-center gap-2 pb-2 px-0 rounded-none bg-transparent text-sm capitalize border-b-2 ${
                  isActive
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
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default CustomersSubmenu;
