import React from "react";
import { useLocation } from "react-router-dom";
import CustomersSubmenu from "./CustomersSubmenu";
import VendorsSubmenu from "./VendorsSubmenu";
import TripMasterSubmenu from "./TripMasterSubmenu";
import FinanceSubmenu from "./FinanceSubmenu";
import DocumentVerificationSubmenu from "./DocumentVerificationSubmenu";
import MarketingSubmenu from "./MarketingSubmenu";
import AdminSubmenu from "./AdminSubmenu";
import AllRecordsSubmenu from "./AllRecordsSubmenu";
import SupportSubmenu from "./SupportSubmenu";
import { Feature } from "@/utils/constants";
export function Topnav({ permissions = [] }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const AllRecordsSection =
    path.startsWith("/dashboard/booking/list") ||
    path.startsWith("/dashboard/booking/list/actingdriver") ||
    path.startsWith("/dashboard/booking/list/rides") ||
    path.startsWith("/dashboard/booking/list/rentals") ||
    (Feature.parcel && path.startsWith("/dashboard/booking/list/parcel"));

  const isCustomersSection =
    path.startsWith("/dashboard/customers");

  const isSupportSection =
    path.startsWith("/dashboard/rental-rate-card") ||
    path.startsWith("/dashboard/leads") ||
    path.startsWith("/dashboard/doc-verification") ||
    // Vendors operations (but NOT marketing notification routes)
    path.startsWith("/dashboard/vendors/account") ||
    path.startsWith("/dashboard/vendors/vehiclelist") ||
    path.startsWith("/dashboard/vendors/onlinevehicleslist") ||
    path.startsWith("/dashboard/vendors/account/allvehicles") ||
    path.startsWith("/dashboard/vendors/account/autoview") ||
    path.startsWith("/dashboard/vendors/account/autolist");

  const isVendorsSection =
    path.startsWith("/dashboard/vendors/account") ||
    path.startsWith("/dashboard/vendors/account/drivers") ||
    path.startsWith("/dashboard/vendors/vehiclelist") ||
    path.startsWith("/dashboard/vendors/onlinevehicleslist") ||
    path.startsWith("/dashboard/vendors/account/allvehicles") ||
    path.startsWith("/dashboard/vendors/account/autoview") ||
    path.startsWith("/dashboard/vendors/account/autolist");

   const isTripMasterSection =
    path.startsWith("/dashboard/tripdetails") ||
    path.startsWith("/dashboard/reports/tripmasterreport"); 
    
  const isFinanceSection =
    path.startsWith("/dashboard/finance/invoice") ||
    path.startsWith("/dashboard/finance/receipt") ||
    path.startsWith("/dashboard/finance/master-subscription");

  const isDocVerifiction = 
    path.startsWith("/dashboard/doc-verification") ||
    path.startsWith("/dashboard/doc-verification/pending");
  
  const isMarketingSection = 
    path.startsWith("/dashboard/vendors/notificationlist") ||
    path.startsWith("/dashboard/vendors/customernotificationlist") ||
    path.startsWith("/dashboard/vendors/drivernotificationlist") ||
    path.startsWith("/dashboard/user/bannerimgview") ||
    path.startsWith("/dashboard/user/bannerimg/add") ||
    path.startsWith("/dashboard/user/testimonialview") ||
    path.startsWith("/dashboard/user/testimonial/add");

  const isAdminSection =
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/admin/geo-markings") ||
    path.startsWith("/dashboard/user/versioncontrol") ||
    path.startsWith("/dashboard/user/discountmodule") ||
    path.startsWith("/dashboard/user/gst") ||
    path.startsWith("/dashboard/driver-ops") ||
    // Also show admin top bar on Trip Master and Calls
    path.startsWith("/dashboard/tripdetails") ||
    path.startsWith("/dashboard/reports/tripmasterreport") ||
    path.startsWith("/dashboard/exotel-calls");


  // If we are not in any section that has a top nav, render nothing
  if (
    !AllRecordsSection &&
    !isSupportSection &&
    !isCustomersSection &&
    !isVendorsSection &&
    !isTripMasterSection &&
    !isFinanceSection &&
    !isDocVerifiction &&
    !isMarketingSection &&
    !isAdminSection
  ) {
    return null;
  }

// topnav.jsx
return (
  <div className="mt-3 px-3 sm:mt-4 sm:px-6 bg-blue-gray-100">
    <div className="rounded-xl border- border-blue-gray-100 bg-white p-2 pb-0 pt-0  shadow-sm">
    {/* First row: high-level Support tabs */}
    {isSupportSection && (
      <div className="mb-2 overflow-x-auto whitespace-nowrap">
        <SupportSubmenu permissions={permissions} />
      </div>
    )}

 

    {/* Main row: other section-specific submenus */}
    <div className="overflow-x-auto whitespace-nowrap">
      {AllRecordsSection && <AllRecordsSubmenu />}
      {isCustomersSection && <CustomersSubmenu />}
      {isVendorsSection && <VendorsSubmenu />}
      {isFinanceSection && <FinanceSubmenu />}
      {isDocVerifiction && <DocumentVerificationSubmenu />}
      {isMarketingSection && <MarketingSubmenu />}
      {isAdminSection && <AdminSubmenu permissions={permissions} />}
    </div>
       {/* Optional Trip Master row: Details / Reports */}
    {isTripMasterSection && (
      <div className="mb-2 overflow-x-auto whitespace-nowrap">
        <TripMasterSubmenu />
      </div>
    )}
    </div>
  </div>
);

}

Topnav.displayName = "/src/widgets/layout/topnav.jsx";

export default Topnav;