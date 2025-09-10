import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, permission, permissions }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (permission && !permissions.includes(permission)) {
    return <Navigate to="/dashboard/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;