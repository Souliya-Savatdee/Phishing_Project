
import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "@/context/authProvider";



import { jwtDecode } from 'jwt-decode';

const RequireAuth = ({ allowedRoles, requiredPermissions = [] }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const accessToken = auth?.accessToken || '';
  let decodedToken;

  if (accessToken) {
    try {
      decodedToken = jwtDecode(accessToken);
    } catch (error) {
      console.error('Failed to decode token', error);
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (!accessToken || !decodedToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = decodedToken?.role && allowedRoles.includes(decodedToken.role);
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    decodedToken?.permissions?.includes(permission)
  );

  if (!hasRequiredRole || !hasRequiredPermissions) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;



