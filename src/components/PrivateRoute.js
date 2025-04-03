import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUserRole } from "../localStorageWithExpiry";

const PrivateRoute = ({ allowedRoles, children }) => {
  const userRole = getUserRole();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="*" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute; 