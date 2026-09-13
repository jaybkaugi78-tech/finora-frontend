import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../services/api";
export default function Topbar() {
  const user = getStoredUser();
  const initial = (user?.full_name || "F")[0].toUpperCase();
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />
        <input placeholder="Search your finances..." />
      </div>
      <div className="topbar-actions">
        <Link className="icon-button" to="/notifications">
          <Bell size={19} />
        </Link>
        <Link className="profile-chip" to="/settings">
          <div className="avatar">{initial}</div>
          <div>
            <strong>{user?.full_name || "Finora User"}</strong>
            <span>Personal</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
