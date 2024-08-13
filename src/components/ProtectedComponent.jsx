import { Navigate, useLocation } from "react-router-dom";
//import { useAuth } from "@/context/auth";

function ProtectedRoute({ children }) {
  //const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;