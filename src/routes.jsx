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
import { OnlineRegistrationView } from "./pages/onlineRegistration/view";
import {SubscriptionView} from './pages/subscription/view';
import SubscriptionAdd from "./pages/subscription/add";

// import { SearchDrivers } from "./pages/booking";


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
        path: "/drivers",
        element: <DriverView />,
        display: true
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/drivers/add",
        element: <DriverAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/drivers/details/:id",
        element: <DriverDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/account/details/:id",
        element: <AccountDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "drivers",
        path: "/drivers/edit/:id",
        element: <DriverEdit />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "accounts",
        path: "/account/edit/:id",
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
        path: "/cab/add",
        element: <CabAdd />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cab",
        path: "/cab/details/:id",
        element: <CabDetails />,
        display: false
      },
      {
        icon: <UserIcon {...icon} />,
        name: "cab",
        path: "/cab/edit/:id",
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
        name: "users",
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
        path: "/account/add",
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
        icon: <HomeModernIcon {...icon} />,
        name: "BookingsList",
        path: "/booking/list",
        element: <BookingsList />,
        display: false,
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
        path: "/account",
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
        name: "Online Registration",
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
