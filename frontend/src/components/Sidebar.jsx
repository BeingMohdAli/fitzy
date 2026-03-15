import keycloak from "../keycloak";

const navItems = [
  { id: "dashboard",  icon: "⚡", label: "Home" },
  { id: "activities", icon: "🏃", label: "Activity" },
  { id: "log",        icon: "➕", label: "Log" },
  { id: "recommend",  icon: "🤖", label: "AI" },
  { id: "profile",    icon: "👤", label: "Profile" },
];

export default function Sidebar({ page, setPage, user }) {
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">FITzy</div>

      {navItems.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`nav-item ${page === id ? "active" : ""}`}
          onClick={() => setPage(id)}
          title={label}
        >
          <span>{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}

      <div className="sidebar-bottom">
        <div
          className="user-avatar"
          style={{ cursor: "pointer" }}
          title={`Logout (${user?.email || ""})`}
          onClick={() => keycloak.logout()}
        >
          {initials}
        </div>
      </div>
    </nav>
  );
}
