import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "@/pages/DashboardPage";
import CampaignsPage from "@/pages/CampaignsPage";
import RCampaignsPage from "@/pages/RCampaignsPage";
import UserAndGroupPage from "@/pages/UserAndGroupPage";
import EmailTemplatesPage from "@/pages/EmailTemplatesPage";
import LandingPage from "@/pages/LandingPage";
import SendingProfilesPage from "@/pages/SendingProfilesPage";
import UserManagementPage from "@/pages/UserManagementPage";
import LoginPage from "@/pages/LoginPage";

import UDashboardPage from "@/pages/uPages/UDashboardPage";
import UCampaignsPage from "@/pages/uPages/UCampaignsPage";
import URCampaignsPage from "@/pages/uPages/URCampaignsPage";
import UUserManagementPage from "@/pages/uPages/UUserManagementPage";


import NotFoundPage from "@/pages/NotFoundPage";
import Unauthorized from "@/pages/Unauthorized";
import Refresh from "@/pages/Refresh";
import RequireAuth from "@/require/RequestAuth";
import Persist from "@/middleware/persistent";




import "./App.css";

export default function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route element={<Persist />}>
            {/* Admin Role */}
            <Route
              element={
                <RequireAuth
                  allowedRoles={["admin"]}
                  requiredPermissions={["edit", "write", "view"]}
                />
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/result/:cam_id" element={<RCampaignsPage />} />
              <Route path="/user-and-group" element={<UserAndGroupPage />} />
              <Route path="/email-templates" element={<EmailTemplatesPage />} />
              <Route path="/landing-pages" element={<LandingPage />} />
              <Route path="/sending-profiles" element={<SendingProfilesPage />}/>
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/refresh" element={<Refresh />} />
            </Route>

            {/* User Role */}
            <Route
              element={
                <RequireAuth
                  allowedRoles={["user"]}
                  requiredPermissions={["view"]}
                />
              }
            >
              <Route path="/u/" element={<UDashboardPage />} />
              <Route path="/u/user-management" element={<UUserManagementPage />} />
              <Route path="/u/dashboard" element={<UDashboardPage />} />
              <Route path="/u/campaigns" element={<UCampaignsPage />} />
              <Route path="/u/campaigns/result/:cam_id" element={<URCampaignsPage />} />
              <Route path="/refresh" element={<Refresh />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </div>
  );
}
