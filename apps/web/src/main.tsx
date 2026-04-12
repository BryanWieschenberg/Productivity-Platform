import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "@/index.css";
import App from "@/App";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import AppShell from "./components/AppShell";

const router = createBrowserRouter([{ path: "*", Component: App }]);

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <AppShell>
                    <RouterProvider router={router} />
                </AppShell>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
);
