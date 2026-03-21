import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserRole } from "../localStorageWithExpiry";

const PrivateRoute = ({ allowedRoles, children }) => {
  const userRole = getUserRole();
  const location = useLocation();

  if (!userRole) {
    // Redirect to login with the current pathname as the callback URL
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="*" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute; 