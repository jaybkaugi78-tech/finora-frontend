import {
  BarChart3,
  BellRing,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  ReceiptText,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  clearSession,
} from "../services/api";


const mainItems = [
  ["/", "Overview", LayoutDashboard],
  ["/transactions", "Transactions", ReceiptText],
  ["/budgets", "Budgets", CircleDollarSign],
  ["/goals", "Goals", Target],
  ["/accounts", "Accounts", WalletCards],
  ["/bills", "Bills", BellRing],
  ["/analytics", "Analytics", BarChart3],
];

const secondaryItems = [
  ["/settings", "Settings", Settings],
];


export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-mark">
          <PiggyBank size={22} />
        </div>

        <div className="brand-copy">
          <strong>FINORA</strong>
          <span>Your money, clearly.</span>
        </div>
      </div>


      <div className="sidebar-content">

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">
            Money
          </span>

          {mainItems.map(
            ([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({
                  isActive,
                }) =>
                  `nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </NavLink>
            )
          )}
        </nav>


        <nav className="sidebar-nav sidebar-secondary-nav">
          <span className="sidebar-section-label">
            Account
          </span>

          {secondaryItems.map(
            ([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({
                  isActive,
                }) =>
                  `nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </NavLink>
            )
          )}
        </nav>

      </div>


      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Sign out</span>
      </button>

    </aside>
  );
}