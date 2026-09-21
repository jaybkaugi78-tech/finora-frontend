import {
  Bell,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getStoredUser,
} from "../services/api";


export default function Topbar() {
  const user =
    getStoredUser();

  const initial =
    (
      user?.full_name ||
      "F"
    )[0].toUpperCase();


  return (
    <header className="topbar">

      <div className="topbar-context">
        <span>
          FINORA
        </span>

        <strong>
          Financial workspace
        </strong>
      </div>


      <div className="topbar-actions">

        <Link
          className="icon-button"
          to="/notifications"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </Link>


        <Link
          className="profile-chip"
          to="/settings"
          title="Account settings"
        >
          <div className="avatar">
            {initial}
          </div>

          <div className="profile-chip-copy">
            <strong>
              {user?.full_name ||
                "Finora User"}
            </strong>

            <span>
              Personal
            </span>
          </div>
        </Link>

      </div>

    </header>
  );
}