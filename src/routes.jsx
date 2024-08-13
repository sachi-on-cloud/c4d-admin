import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

import { CustomerView } from "@/pages/customer";
import { DriverView } from "@/pages/driver";
import { UserView } from "@/pages/users";
import DriverAdd from "./pages/driver/add";
import UserAdd from "./pages/users/add";
import CustomerAdd from "./pages/customer/add";

import { HomeModernIcon } from "@heroicons/react/24/outline";
import Booking from "./pages/booking/booking";
import ConfirmBooking from "./pages/booking/confirmBooking";
import SelectLocation from "./pages/booking/selectLocation";
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
        display: true
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
        display: true
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
        display: true
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
        display: true
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
        path: "/drivers/edit/:id",
        element: <DriverAdd />,
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
        icon: <HomeModernIcon {...icon} />,
        name: "Booking",
        path: "/booking",
        element: <Booking />,
        display: true,
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
        display: true
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
        display: true
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
