// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// component that checks if the user is authenticated before rendering
//  the children components by using the AuthContext. If the user is not
//  authenticated, it redirects to the login page.

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;