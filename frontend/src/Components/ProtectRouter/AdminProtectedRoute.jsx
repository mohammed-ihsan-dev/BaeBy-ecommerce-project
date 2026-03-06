import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

/**
 * AdminProtectedRoute
 * 
 * Verifies that the user is logged in AND has the "admin" role.
 * If not, redirects to the home page.
 */
const AdminProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    // Try to get user from localStorage if context is not yet populated (on refresh)
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = user || savedUser;

    if (!currentUser || currentUser.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
