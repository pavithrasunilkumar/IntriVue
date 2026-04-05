import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { CompanyLayout } from "./components/CompanyLayout";
import { Home } from "./pages/Home";
import { AppliedJobs } from "./pages/AppliedJobs";
import { Profile } from "./pages/Profile";
import { AboutUs } from "./pages/AboutUs";
import { Login } from "./pages/Login";
import { RoleSelection } from "./pages/RoleSelection";
import { Signup } from "./pages/Signup";
import { ProfileDetails } from "./pages/ProfileDetails";
import { CompanySignup } from "./pages/CompanySignup";
import { CompanyDashboard } from "./pages/CompanyDashboard";
import { CreateJob } from "./pages/CreateJob";
import { CompanyProfile } from "./pages/CompanyProfile";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Auth Routes
  { path: "/login", Component: Login },
  { path: "/role-selection", Component: RoleSelection },
  { path: "/signup", Component: Signup },
  { path: "/profile-details", Component: ProfileDetails },
  { path: "/company-signup", Component: CompanySignup },

  // Redirect root to login if not authenticated
  { path: "/", element: <Navigate to="/login" replace /> },

  // Job Seeker Routes (protected)
  {
    path: "/home",
    element: <RequireAuth><Layout /></RequireAuth>,
    children: [
      { index: true, Component: Home },
      { path: "dashboard", Component: AppliedJobs },
      { path: "profile", Component: Profile },
      { path: "about", Component: AboutUs },
    ],
  },

  // Company Routes (protected)
  {
    path: "/company",
    element: <RequireAuth><CompanyLayout /></RequireAuth>,
    children: [
      { path: "dashboard", Component: CompanyDashboard },
      { path: "create-job", Component: CreateJob },
      { path: "profile", Component: CompanyProfile },
    ],
  },
]);