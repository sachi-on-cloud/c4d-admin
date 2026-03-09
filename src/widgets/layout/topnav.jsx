import React from "react";
import { useLocation } from "react-router-dom";
import CustomersSubmenu from "./CustomersSubmenu";
import VendorsSubmenu from "./VendorsSubmenu";
import MarketingSubmenu from "./MarketingSubmenu";
import AdminSubmenu from "./AdminSubmenu";
import AllRecordsSubmenu from "./AllRecordsSubmenu";
import SupportSubmenu from "./SupportSubmenu";
import FinanceSubmenu from "./FinanceSubmenu";
import { NAV_UI } from "@/utils/constants";
export function Topnav({ permissions = [] }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const isAllRecordsSection =
    path.startsWith("/dashboard/booking/list") ||
    path.startsWith("/dashboard/auto");

  const isCustomersSection =
    path.startsWith("/dashboard/customers");

  const isSupportSection =
    path.startsWith("/dashboard/rental-rate-card") ||
    path.startsWith("/dashboard/leads");

  const isVendorsSection =
    path.startsWith("/dashboard/vendors/account") ||
    path.startsWith("/dashboard/vendors/account/drivers") ||
    path.startsWith("/dashboard/vendors/vehiclelist") ||
    path.startsWith("/dashboard/vendors/onlinevehicleslist") ||
    path.startsWith("/dashboard/vendors/account/allvehicles") ||
    path.startsWith("/dashboard/vendors/account/autoview") ||
    path.startsWith("/dashboard/vendors/account/autolist") ||
    path.startsWith("/dashboard/doc-verification") ||
    path.startsWith("/dashboard/doc-verification/pending");
  
  const isMarketingSection = 
    path.startsWith("/dashboard/vendors/driver-incentive") ||
    path.startsWith("/dashboard/vendors/notificationlist") ||
    path.startsWith("/dashboard/vendors/customernotificationlist") ||
    path.startsWith("/dashboard/vendors/drivernotificationlist") ||
    path.startsWith("/dashboard/user/bannerimgview") ||
    path.startsWith("/dashboard/user/bannerimg/add")
    // path.startsWith("/dashboard/user/testimonialview") ||
    // path.startsWith("/dashboard/user/testimonial/add");

  const isFinanceSection = path.startsWith("/dashboard/finance");
  const isAdminSection =
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/admin/geo-markings") ||
    path.startsWith("/dashboard/user/versioncontrol") ||
    path.startsWith("/dashboard/user/discountmodule") ||
    path.startsWith("/dashboard/user/gst") ||
    path.startsWith("/dashboard/driverengagement") ||
    // Also show admin top bar on Trip Master and Calls
    path.startsWith("/dashboard/tripdetails")


  // If we are not in any section that has a top nav, render nothing
  if (
    !isAllRecordsSection &&
    !isSupportSection &&
    !isCustomersSection &&
    !isVendorsSection &&
    // !isDocVerifiction &&
    !isMarketingSection &&
    !isFinanceSection &&
    !isAdminSection
  ) {
    return null;
  }

// topnav.jsx
return (
  <div className="mt-3 px-3 sm:mt-4 sm:px-6">
    <div className={`rounded-xl border-t ${NAV_UI.colors.sidebarBorder} ${NAV_UI.colors.topnavContainerBg} p-2 shadow-sm`}>
    {/* First row: high-level Support tabs */}
    {isSupportSection && (
      <div className="mb-2 overflow-x-auto whitespace-nowrap">
        <SupportSubmenu permissions={permissions} />
      </div>
    )}

 

    {/* Main row: other section-specific submenus */}
    <div className="overflow-x-auto whitespace-nowrap">
      {isAllRecordsSection && <AllRecordsSubmenu />}
      {isCustomersSection && <CustomersSubmenu />}
      {isVendorsSection && <VendorsSubmenu />}
      {isMarketingSection && <MarketingSubmenu />}
      {isFinanceSection && <FinanceSubmenu />}
      {isAdminSection && <AdminSubmenu permissions={permissions} />}
    </div>
    </div>
  </div>
);

}

Topnav.displayName = "/src/widgets/layout/topnav.jsx";

export default Topnav;