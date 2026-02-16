import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";

function SupportSubmenu({ permissions = [] }) {
  const items = [
    { label: "Rate Card", path: "/dashboard/rental-rate-card", requiredPermission: "Support" },
    { label: "Leads", path: "/dashboard/leads", requiredPermission: "Support" },
    { label: "Vendors", path: "/dashboard/vendors/account", requiredPermission: "Vendors" },
    { label: "Document Verification", path: "/dashboard/doc-verification", requiredPermission: "Document verification" },
  ];
  const filteredItems = items.filter(({ requiredPermission }) => permissions.includes(requiredPermission));

  if (!filteredItems.length) {
    return null;
  }

  return (
    <ul className="flex items-center gap-6  overflow-x-auto whitespace-nowrap">
      {filteredItems.map(({ label, path }) => (
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
                  className="font-medium px-3 tracking-normal capitalize"
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

export default SupportSubmenu;
