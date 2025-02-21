import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { Navigate, useLocation } from "react-router-dom";
// import { useSelector } from 'react-redux';
//import { useAuth } from "@/context/auth";

function ProtectedRoute({ children }) { // ,page
    //const { user } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to the login page if not authenticated
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    // const { permissions } = useSelector((state) => state.auth.user);
    // console.log("PAAPPAPPAP",permissions)

    // // Check if user has the permission to access the page
    // if (!permissions.includes(page)) {
    //     return <Navigate to="/unauthorized" replace />;
    // }

    //const data = await ApiRequestUtils.get(API_ROUTES.GET_USER_BY_TOKEN)
    //console.log(data.data);

    return children;
}

export default ProtectedRoute;