import {
  HomeIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Home } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

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
import {SubscriptionView} from './pages/subscription/view';
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
        name: "drivers",
        path: "/vendors/account/drivers",
        element: <DriverView />,
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
        element: <UserAdd />,
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
        element: <AllBookingsLists type={''}/>,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Cab bookings",
        path: "/booking/list/cabBooking",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.CAB_BOOKING}/>,
        display: false
      },
      
      {
        icon: <UserIcon {...icon} />,
        name: "Car Wash Bookings",
        path: "/booking/list/carWash",
        element: <AllBookingsLists type={BOOKING_SERVICE_TYPE.CAR_WASH}/>,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "Acting Driver Bookings",
        path: "/booking/list/actingDriver",
        element: <AllBookingsLists  type={BOOKING_SERVICE_TYPE.DRIVER}/>,
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
