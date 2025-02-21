import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { AuthProvider } from "./context/auth";
import ProtectedRoute from '@/components/ProtectedComponent';
// import { useSelector } from "react-redux";
// import { CustomerView } from "./pages/customer";
// import Booking from "./pages/booking/allBookingLists";
// import { Home } from "./pages/dashboard";
// import CustomerAdd from "./pages/customer/add";
// import CustomerDetails from "./pages/customer/details";
// import { DriverView } from "./pages/driver";
// import DriverAdd from "./pages/driver/add";
// import DriverDetails from "./pages/driver/details";
// import AccountDetails from "./pages/account/details";
// import DriverEdit from "./pages/driver/edit";
// import { AllVehicles } from "./pages/vendor";
// import AccountEdit from "./pages/account/edit";
// import { CabView } from "./pages/cab";
// import CabAdd from "./pages/cab/add";
// import CabDetails from "./pages/cab/details";
// import CabEdit from "./pages/cab/edit";
// import AddPriceDetails from "./pages/cab/addPriceDetails";
// import { UserView } from "./pages/users";
// import UserAdd from "./pages/users/add";
// import UserDetails from "./pages/users/details";
// import AccountAdd from "./pages/account/add";
// import SelectLocation from "./pages/booking/selectLocation";
// import ConfirmBooking from "./pages/booking/confirmBooking";
// import { SearchDrivers } from "./pages/booking";
// import Commission from "./pages/commission/add";
// import { AccountView } from "./pages/account";
// import { DocumentVerificationView } from "./pages/docVerification/view";
// import { OnlineRegistrationView } from "./pages/onlineRegistration/view";
// import { SubscriptionView } from "./pages/subscription/view";
// import SubscriptionAdd from "./pages/subscription/add";
// import DocumentsDetails from "./pages/docVerification/details";
// import { PendingDocList } from "./pages/docVerification/pendingDocList";
// import { CabSubscriptionView } from "./pages/finance";
// import CabSubscriptionAdd from "./pages/finance/subscription/cab-subscription-add";
// import ReassignDriver from "./components/ReassignDriver";
// import PayableView from "./pages/finance/payable/view";
// import PayableDetails from "./pages/finance/payable/details";

function App() {

  // const permissions = useSelector((state) => state.auth.user.permissions);
  // console.log("Permision",permissions)

  return (
    <AuthProvider>
      <Routes>
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<Navigate to="/dashboard/booking" replace />} />
        {/* <Route path="*" element={<Dashboard />} /> */}
            {/* <Route path="/dashboard/booking" element={<Dashboard />} />
            <Route path="/booking" element={<ProtectedComponent page="booking"><Booking /></ProtectedComponent>} />
            <Route path="/customers" element={<ProtectedComponent page="customers"><CustomerView /></ProtectedComponent>} />
            <Route path="/customers/add" element={<ProtectedComponent page="customers"><CustomerAdd /></ProtectedComponent>} />
            <Route path="/customers/edit/:id" element={<ProtectedComponent page="customers"><CustomerAdd /></ProtectedComponent>} />
            <Route path="/customers/details/:id" element={<ProtectedComponent page="customers"><CustomerDetails /></ProtectedComponent>} />
            <Route path="/vendors/account/drivers" element={<ProtectedComponent page="drivers"><DriverView /></ProtectedComponent>} />
            <Route path="/vendors/account/drivers/add" element={<ProtectedComponent page="drivers"><DriverAdd /></ProtectedComponent>} />
            <Route path="/vendors/account/drivers/details/:id" element={<ProtectedComponent page="drivers"><DriverDetails /></ProtectedComponent>} />
            <Route path="/vendors/account/details/:id" element={<ProtectedComponent page="drivers"><AccountDetails /></ProtectedComponent>} />
            <Route path="/vendors/account/drivers/edit/:id" element={<ProtectedComponent page="drivers"><DriverEdit /></ProtectedComponent>} />
            <Route path="/vendors/account/allVehicles" element={<ProtectedComponent page="vehicles"><AllVehicles /></ProtectedComponent>} />
            <Route path="/vendors/account/edit/:id" element={<ProtectedComponent page="drivers"><AccountEdit /></ProtectedComponent>} />
            <Route path="/cab" element={<ProtectedComponent page="cabs"><CabView /></ProtectedComponent>} />
            <Route path="/vendors/account/allVehicles/add" element={<ProtectedComponent page="cabs"><CabAdd /></ProtectedComponent>} />
            <Route path="/vendors/account/allVehicles/details/:id" element={<ProtectedComponent page="cabs"><CabDetails /></ProtectedComponent>} />
            <Route path="/vendors/account/allVehicles/edit/:id" element={<ProtectedComponent page="cabs"><CabEdit /></ProtectedComponent>} />
            <Route path="/drivers/addprice" element={<ProtectedComponent page="drivers"><AddPriceDetails /></ProtectedComponent>} />
            <Route path="/users" element={<ProtectedComponent page="Users"><UserView /></ProtectedComponent>} />
            <Route path="/users/add" element={<ProtectedComponent page="Users"><UserAdd /></ProtectedComponent>} />
            <Route path="/users/edit/:id" element={<ProtectedComponent page="Users"><UserAdd /></ProtectedComponent>} />
            <Route path="/users/details/:id" element={<ProtectedComponent page="Users"><UserDetails /></ProtectedComponent>} />
            <Route path="/vendors/account/add" element={<ProtectedComponent page="accounts"><AccountAdd /></ProtectedComponent>} />
            <Route path="/admin/account/:accountId" element={<ProtectedComponent page="accounts"><AccountEdit /></ProtectedComponent>} />
            <Route path="/select-location" element={<ProtectedComponent page="SelectLocation"><SelectLocation /></ProtectedComponent>} />
            <Route path="/confirm-booking" element={<ProtectedComponent page="ConfirmBooking"><ConfirmBooking /></ProtectedComponent>} />
            <Route path="/search-drivers" element={<ProtectedComponent page="SearchDriver"><SearchDrivers /></ProtectedComponent>} />
            <Route path="/commission" element={<ProtectedComponent page="Commission"><Commission /></ProtectedComponent>} />
            <Route path="/vendors/account" element={<ProtectedComponent page="Account"><AccountView /></ProtectedComponent>} />
            <Route path="/doc-verification" element={<ProtectedComponent page="Document Verification"><DocumentVerificationView /></ProtectedComponent>} />
            <Route path="/online-registration" element={<ProtectedComponent page="Mobile user registration"><OnlineRegistrationView /></ProtectedComponent>} />
            <Route path="/subscription" element={<ProtectedComponent page="subscription"><SubscriptionView /></ProtectedComponent>} />
            <Route path="/subscription/add" element={<ProtectedComponent page="subscription"><SubscriptionAdd /></ProtectedComponent>} />
            <Route path="/doc-verification/documents-details/:id" element={<ProtectedComponent page="Documents details"><DocumentsDetails /></ProtectedComponent>} />
            <Route path="/booking/list" element={<ProtectedComponent page="All bookings List"><AllBookingsLists type={''} /></ProtectedComponent>} />
            <Route path="/booking/list/cabBooking" element={<ProtectedComponent page="Cab bookings"><AllBookingsLists type={BOOKING_SERVICE_TYPE.CAB_BOOKING} /></ProtectedComponent>} />
            <Route path="/booking/list/carWash" element={<ProtectedComponent page="Car Wash Bookings"><AllBookingsLists type={BOOKING_SERVICE_TYPE.CAR_WASH} /></ProtectedComponent>} />
            <Route path="/booking/list/actingDriver" element={<ProtectedComponent page="Acting Driver Bookings"><AllBookingsLists type={BOOKING_SERVICE_TYPE.DRIVER} /></ProtectedComponent>} />
            <Route path="/doc-verification/pending" element={<ProtectedComponent page="Document Verification"><PendingDocList /></ProtectedComponent>} />
            <Route path="/doc-verification/pending/documents-details/:id" element={<ProtectedComponent page="Documents details"><DocumentsDetails /></ProtectedComponent>} />
            <Route path="/finance/cab-subscription" element={<ProtectedComponent page="Cab Subscription"><CabSubscriptionView /></ProtectedComponent>} />
            <Route path="/finance/cab-subscription/add" element={<ProtectedComponent page="Add Subscription"><CabSubscriptionAdd /></ProtectedComponent>} />
            <Route path="/vendors/account/allVehicles/assignDriver/:id" element={<ProtectedComponent page="Assign Driver"><ReassignDriver /></ProtectedComponent>} />
            <Route path="/finance/payable" element={<ProtectedComponent page="Payable"><PayableView /></ProtectedComponent>} />
            <Route path="/finance/payable/details/:id" element={<ProtectedComponent page="Payable Details"><PayableDetails /></ProtectedComponent>} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
