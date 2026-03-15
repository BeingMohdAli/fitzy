import { useState, useEffect } from "react";
import keycloak from "./keycloak";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import LogActivity from "./pages/LogActivity";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (keycloak.tokenParsed) {
      setUser({
        id: keycloak.tokenParsed.sub,
        email: keycloak.tokenParsed.email,
        firstName: keycloak.tokenParsed.given_name || "",
        lastName: keycloak.tokenParsed.family_name || "",
      });
      // Auto-sync user on login
      import("./api/userApi").then(({ syncUser }) => {
        syncUser({
          keycloakId: keycloak.tokenParsed.sub,
          email: keycloak.tokenParsed.email,
          firstName: keycloak.tokenParsed.given_name || "",
          lastName: keycloak.tokenParsed.family_name || "",
        }).catch(console.error);
      });
    }
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":  return <Dashboard user={user} setPage={setPage} />;
      case "activities": return <Activities user={user} setPage={setPage} />;
      case "log":        return <LogActivity user={user} setPage={setPage} />;
      case "recommend":  return <Recommendations user={user} />;
      case "profile":    return <Profile user={user} />;
      default:           return <Dashboard user={user} setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} />
      <div className="main-scroll">
        <div className="main-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
