import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignUp from "@/pages/auth/SignUp";
import SignIn from "@/pages/auth/SignIn";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import VerifyPending from "@/pages/auth/VerifyPending";
import Workspace from "@/pages/Workspace";

export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/signup"
                element={user ? <Navigate to="/workspace" replace /> : <SignUp />}
            />
            <Route
                path="/signin"
                element={user ? <Navigate to="/workspace" replace /> : <SignIn />}
            />
            <Route
                path="/verify"
                element={user ? <Navigate to="/workspace" replace /> : <VerifyEmail />}
            />
            <Route
                path="/verify-pending"
                element={user ? <Navigate to="/workspace" replace /> : <VerifyPending />}
            />
            <Route
                path="/forgot-password"
                element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
            />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/workspace" element={<Workspace />} />
            </Route>

            <Route
                path="*"
                element={user ? <Navigate to="/workspace" /> : <Navigate to="/signin" replace />}
            />
        </Routes>
    );
}
