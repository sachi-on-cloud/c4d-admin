import {
  HomeIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Home } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { DeleteAccount } from "@/pages/public/DeleteAccount";
import { PriceList } from "@/pages/public/price";

import { CustomerView } from "@/pages/customer";
import { AccountView } from "@/pages/account";
import { DriverView } from "@/pages/driver";
import { UserView } from "@/pages/users";
import DriverAdd from "./pages/driver/add";
import UserAdd from "./pages/users/add";
import CustomerAdd from "./pages/customer/add";

import { HomeModernIcon } from "@heroicons/react/24/outline";
import Booking from "./pages/booking/booking";
import ConfirmBooking from "./pages/booking/confirmBooking";
import SelectLocation from "./pages/booking/selectLocation";
import DriverDetails from "./pages/driver/details";
import AccountDetails from "./pages/account/details";
import AddPriceDetails from "./pages/driver/addPriceDetails";
import { BookingsList, SearchDrivers } from "./pages/booking";
import UserDetails from "./pages/users/details";
import CustomerDetails from "./pages/customer/details";
import Commission from "./pages/commission/add";
import DriverEdit from "./pages/driver/edit";
import { CabView } from "./pages/cab";
import CabAdd from "./pages/cab/add";
import CabDetails from "./pages/cab/details";
import CabEdit from "./pages/cab/edit";
import AccountAdd from "./pages/account/add";
import AccountEdit from "./pages/account/edit";
import { DocumentVerificationView } from "./pages/docVerification/view";
import DocumentsDetails from './pages/docVerification/details'
import { OnlineRegistrationView } from "./pages/onlineRegistration/view";
import { SubscriptionView } from './pages/subscription/view';
import SubscriptionAdd from "./pages/subscription/add";
import AllBookingsLists from "./pages/booking/allBookingLists";
import { PendingDocList } from "./pages/docVerification/pendingDocList";
import { BOOKING_SERVICE_TYPE } from "./utils/constants";
import { AllVehicles } from "./pages/vendor";
import { CabSubscriptionView } from "./pages/finance/subscription/cab-subscription-view";
import CabSubscriptionAdd from "./pages/finance/subscription/cab-subscription-add";
import ReassignDriver from "./components/ReassignDriver";
import PayableView from "./pages/finance/payable/view";
import PayableDetails from "./pages/finance/payable/details";
import UserEdit from "./pages/users/edit";
import { MasterSubscriptionView } from "./pages/finance/masterSubscription/MasterSubscriptionView";
import MasterSubscriptionAdd from "./pages/finance/masterSubscription/MasterSubscriptionAdd";
import MasterSubscriptionDetails from "./pages/finance/masterSubscription/MasterSubscriptionDetails";
import MasterSubscriptionEdit from "./pages/finance/masterSubscription/MasterSubscriptionEdit";
import { MasterPriceView } from "./pages/finance/masterPrice/MasterPriceView";
import { MasterPriceAdd } from "./pages/finance/masterPrice/MasterPriceAdd";
import { ReceiptList } from "./pages/finance/receipt/ReceiptList";
import ReceiptDetails from "./pages/finance/receipt/ReceiptDetails";
import { InvoiceList } from "./pages/finance/invoice/InvoiceList";
import InvoiceDetails from "./pages/finance/invoice/InvoiceDetails";
import { MasterPriceDetailsAndEdit } from "./pages/finance/masterPrice/MasterPriceDetailsAndEdit";
import MasterPriceTableAdd from "./pages/finance/masterPriceTable/MasterPriceTableAdd";
import MasterPriceTableDetails from "./pages/finance/masterPriceTable/MasterPriceTableDetails";
import DriverMasterPriceTableEdit from "./pages/finance/masterPriceTable/DriverMasterPriceTableEdit";
import MasterPriceTableEdit from "./pages/finance/masterPriceTable/MasterPriceTableEdit";
import RentalsPriceMasterAdd from "./pages/finance/masterPriceTable/RentalsMasterPriceAdd";
import RentalsPriceMasterDetails from "./pages/finance/masterPriceTable/RentalsMasterPriceDetails";
import RentalsMasterPriceEdit from "./pages/finance/masterPriceTable/RentalsMasterPriceEdit";
import GeoMarkings from "./pages/geoMarkings/geoMarkings";
import NotificationList from "./pages/vendor/notificationList";
import NotificationListApp from "./pages/vendor/notificationadd";
import InstantReward from "./pages/vendor/instantReward";
import { VehiclesList } from "./pages/vendor/vehiclesList";
import DriverNotificationList from "./pages/vendor/driverNotificationList";
import DriverNotificationListAdd from "./pages/vendor/driverNotificationAdd";
import DriverNotificationListEdit from "./pages/vendor/driverNotificationEdit";
import VersionControlList from "./pages/versionControl/VersionControlList";
import VersionControlEdit from "./pages/versionControl/VersionControlEdit";
import DiscountView from "./pages/discountModule/view";
import DiscountEdit from "./pages/discountModule/edit";
import DiscountAdd from "./pages/discountModule/add";
import GstView from "./pages/GST/view";
import GstAdd from "./pages/GST/add";
import GstEdit from "./pages/GST/edit";
import BannerView from "./pages/bannerImage/view ";
import AddBanner from "./pages/bannerImage/add";
import TestimoinalView from "./pages/testimoinal/view";
import TestimoinalAdd from "./pages/testimoinal/add";
import { OnlineVehiclesList } from "./pages/vendor/onlineVehiclesList";
import AutoView from "./pages/AutoService/AutoView";
import AutoAdd from "./pages/AutoService/autoAdd";
import AutoDetails from "./pages/AutoService/details";
import AutoForm from "./pages/AutoService/autoform";
import ParcelList from "./pages/Parcel/view";
import ParcelAdd from "./pages/Parcel/add";
import ParcelDetails from "./pages/Parcel/details";
import ParcelEdit from "./pages/Parcel/edit";
import Reports from "./pages/TripDetails/reports";
import TripDetails from "./pages/TripDetails/tripDetails";
import AddTripDetails from "./pages/TripDetails/add";
import DetailsAuto from "./pages/AutoDetails/details";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
        display: false
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Booking",
        path: "/booking",
        element: <Booking />,
        display: true,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "customers",
        path: "/customers",
        element: <CustomerView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "customers",
        path: "/customers/add",
        element: <CustomerAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "customers",
        path: "/customers/edit/:id",
        element: <CustomerAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "customers",
        path: "/customers/details/:id",
        element: <CustomerDetails />,
        display: false
      },
      {
         icon: <UserIcon {...icon} />,
        name: "vehicleList",
        path: "/vendors/vehicleList",
        element: <VehiclesList />,
        display: false
      },
       {
         icon: <UserIcon {...icon} />,
        name: "Online Vehicles List",
        path: "/vendors/onlineVehiclesList",
        element: <OnlineVehiclesList />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/vendors/account/drivers",
        element: <DriverView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "marketing",
        path: "/vendors/notificationList",
        element: <NotificationList />,
        display: true
      },
       {
        icon: <UserIcon {...icon} />,
        name: "driver notification",
        path: "/vendors/driverNotificationList",
        element: <DriverNotificationList />,
        display: true
      },
       {
        icon: <UserIcon {...icon} />,
        name: "driver notification add",
        path: "/vendors/driverNotificationList/add",
        element: <DriverNotificationListAdd/>,
        display: true
      },
        {
        icon: <UserIcon {...icon} />,
        name: "driver notification edit",
        path: "/vendors/driverNotificationList/edit/:id",
        element: <DriverNotificationListEdit/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "marketing add",
        path: "/vendors/notification/add",
        element: <NotificationListApp />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/vendors/account/drivers/add",
        element: <DriverAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/vendors/account/drivers/details/:id",
        element: <DriverDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/vendors/account/details/:id",
        element: <AccountDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/vendors/account/drivers/edit/:id",
        element: <DriverEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "vehicles",
        path: "/vendors/account/allVehicles",
        element: <AllVehicles />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/vendors/account/edit/:id",
        element: <AccountEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cabs",
        path: "/cab",
        element: <CabView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cab",
        path: "/vendors/account/allVehicles/add",
        element: <CabAdd />,
        display: false
      },
       {
        icon: <UserIcon {...icon} />,
        name: "Auto View",
        path: "/vendors/account/autoView/add",
        element: <AutoAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        
        name: "Auto Add",
        path: "/vendors/account/autoview",
        element: <AutoView />,
        display: false
      },
       {
        icon: <UserIcon {...icon} />,
        name: "Auto details",
        path: "/vendors/account/autoView/details/:id",
        element: <AutoDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Auto details",
        path: "/vendors/account/autoDetails/details/:id",
        element: <DetailsAuto />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Auto Form",
        path: "/vendors/account/autoView/details/add",
        element: <AutoForm />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cab",
        path: "/vendors/account/allVehicles/details/:id",
        element: <CabDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cab",
        path: "/vendors/account/allVehicles/edit/:id",
        element: <CabEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "parcel View",
        path: "/vendors/account/parcelView",
        element: <ParcelList/>,
        display: false
      },

       {
        icon: <UserIcon {...icon} />,
        name: "parcelAdd",
        path: "/vendors/account/parcelView/add",
        element: <ParcelAdd/>,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "parcelDetails",
        path: "/vendors/account/parcelView/details/:id",
        element: <ParcelDetails/>,
        display: false
      },
       {
        icon: <UserIcon {...icon} />,
        name: "parcelEdit",
        path: "/vendors/account/parcelView/edit/:id",
        element: <ParcelEdit/>,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "GST List",
        path: "/user/GSTList",
        element: <GstView/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "GST add",
        path: "/user/GST/add",
        element: <GstAdd/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "GST edit",
        path: "/user/GST/edit/:id",
        element: <GstEdit/>,
        display: true
      }, 
      {
        icon: <UserIcon {...icon} />,
        name: "Banner image view",
        path: "/user/bannerimgView",
        element: <BannerView/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Banner image add",
        path: "/user/bannerimg/add",
        element: <AddBanner/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/drivers/addprice",
        element: <AddPriceDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Admin User",
        path: "/users",
        element: <UserView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "users",
        path: "/users/add",
        element: <UserAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "users",
        path: "/users/edit/:id",
        element: <UserEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "users",
        path: "/users/details/:id",
        element: <UserDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/vendors/account/add",
        element: <AccountAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/admin/account/:accountId",
        element: <AccountEdit />,
        display: false
      },
      {
        name: "SelectLocation",
        path: "/select-location",
        element: <SelectLocation />,
        display: false
      },
      {
        name: "ConfirmBooking",
        path: "/confirm-booking",
        element: <ConfirmBooking />,
        display: false
      },
      {
        name: "SearchDriver",
        path: "/search-drivers",
        element: <SearchDrivers />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Commission",
        path: "/commission",
        element: <Commission />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Account",
        path: "/vendors/account",
        element: <AccountView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Document Verification",
        path: "/doc-verification",
        element: <DocumentVerificationView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Mobile user registration",
        path: "/online-registration",
        element: <OnlineRegistrationView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "subscription",
        path: "/subscription",
        element: <SubscriptionView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "subscription",
        path: "/subscription/add",
        element: <SubscriptionAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Documents details",
        path: "/doc-verification/documents-details/:id",
        element: <DocumentsDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "All bookings List",
        path: "/booking/list",
        element: <AllBookingsLists type={''} />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Rides bookings",
        path: "/booking/list/rides",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.RIDES} />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Rentals bookings",
        path: "/booking/list/rentals",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.RENTAL} />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Cab bookings",
        path: "/booking/list/cabBooking",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.CAB_BOOKING} />,
        display: false
      },

      {
        icon: <UserIcon {...icon} />,
        name: "Car Wash Bookings",
        path: "/booking/list/carWash",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.CAR_WASH} />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Acting Driver Bookings",
        path: "/booking/list/actingDriver",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.DRIVER} />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Document Verification",
        path: "/doc-verification/pending",
        element: <PendingDocList />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Documents details",
        path: "/doc-verification/pending/documents-details/:id",
        element: <DocumentsDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Cab Subscription",
        path: "/finance/cab-subscription",
        element: <CabSubscriptionView />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Add Subscription",
        path: "/finance/cab-subscription/add",
        element: <CabSubscriptionAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Receipt",
        path: "/finance/master-subscription",
        element: <MasterSubscriptionView />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Subscription Add",
        path: "/finance/master-subscription/add",
        element: <MasterSubscriptionAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Subscription Details",
        path: "/finance/master-subscription/details/:id",
        element: <MasterSubscriptionDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Subscription Edit",
        path: "/finance/master-subscription/edit/:id",
        element: <MasterSubscriptionEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Rides Price Table Add",
        path: "/users/master-price/rides-add",
        element: <MasterPriceTableAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Price View",
        path: "/users/master-price",
        element: <MasterPriceView />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "instant reward",
        path: "/users/instant-reward",
        element: <InstantReward />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Price Add",
        path: "/users/master-price/driver-add",
        element: <MasterPriceAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Price Details & Edit",
        path: "/users/master-price/details/:id",
        element: <MasterPriceDetailsAndEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Driver Price Table Edit",
        path: "/users/master-price/driver-edit/:id",
        element: <DriverMasterPriceTableEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Rentals Master Price Add",
        path: "/users/master-price/rentals-add",
        element: <RentalsPriceMasterAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Rentals Master Price Details",
        path: "/users/master-price/rentals-details/:id",
        element: <RentalsPriceMasterDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Rentals Master Price Edit",
        path: "/users/master-price/rentals-edit/:id",
        element: <RentalsMasterPriceEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Assign Driver",
        path: "/vendors/account/allVehicles/assignDriver/:id",
        element: <ReassignDriver />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Payable",
        path: "/finance/payable",
        element: <PayableView />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Payable Details",
        path: "/finance/payable/details/:id",
        element: <PayableDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Receipt",
        path: "/finance/receipt",
        element: <ReceiptList />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Receipt Details",
        path: "/finance/receipt/details/:receiptNumber",
        element: <ReceiptDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Receipt",
        path: "/finance/invoice",
        element: <InvoiceList />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Receipt Details",
        path: "/finance/invoice/details/:invoiceNumber",
        element: <InvoiceDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Table Rides Details",
        path: "/users/master-price/rides-details/:id",
        element: <MasterPriceTableDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Master Table Rides Edit",
        path: "/users/master-price/rides-edit/:id",
        element: <MasterPriceTableEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "geo-markings",
        path: "/admin/geo-markings",
        element: <GeoMarkings />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "version control add",
        path: "/user/versionControlList",
        element: <VersionControlList />,
        display: true
      },
       {
        icon: <UserIcon {...icon} />,
        name: "version control edit",
        path: "/user/versionControl/edit",
        element: <VersionControlEdit />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "discount module list",
        path: "/user/discountModuleList",
        element: <DiscountView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "discount module edit",
        path: "/user/discountModule/edit/:id",
        element: <DiscountEdit/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "discount module add",
        path: "/user/discountModule/add",
        element: <DiscountAdd/>,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "testimoinal view",
        path: "/user/testimonialView",
        element: <TestimoinalView/>,
        display: true
      },
        {
        icon: <UserIcon {...icon} />,
        name: "testimoinal add",
        path: "/user/testimonial/add",
        element: <TestimoinalAdd/>,
        display: true
      },
        {
        icon: <UserIcon {...icon} />,
        name: "trip details",
        path: "/tripDetails/reports",
        element: <Reports/>,
        display: true
      },
       {
        icon: <UserIcon {...icon} />,
        name: "trip details record",
        path: "/tripDetails",
        element: <TripDetails/>,
        display: true
      },
       {
        icon: <UserIcon {...icon} />,
        name: "tripdetails add",
        path: "/tripDetails/add",
        element: <AddTripDetails/>,
        display: true
      },


    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
        display: false
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
        display: false
      },
    ],
  },
  {
    title: "public pages",
    layout: "public",
    pages: [
      {
        path: "/delete-my-account",
        element: <DeleteAccount />,
        display: false
      },
      {
        path: "/rate-card",
        element: <PriceList />,
        display: false
      },
    ],
  },
  {
    layout: "booking",
    pages: [
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Booking",
        path: "/",
        element: <Booking />,
        display: false
      },
      {
        name: "SelectLocation",
        path: "/select-location",
        element: <SelectLocation />,
        display: false
      },
      {
        name: "ConfirmBooking",
        path: "/confirm-booking",
        element: <ConfirmBooking />,
        display: false
      },
      // {
      //   name: "SearchDriver",
      //   path: "/search-drivers",
      //   element: <SearchDrivers />,
      //   display: false
      // }
    ],
  }
];

export default routes;
