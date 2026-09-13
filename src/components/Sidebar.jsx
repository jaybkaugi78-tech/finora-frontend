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
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../services/api";
const items = [
  ["/", "Overview", LayoutDashboard],
  ["/transactions", "Transactions", ReceiptText],
  ["/budgets", "Budgets", CircleDollarSign],
  ["/goals", "Goals", Target],
  ["/accounts", "Accounts", WalletCards],
  ["/bills", "Bills", BellRing],
  ["/analytics", "Analytics", BarChart3],
  ["/settings", "Settings", Settings],
];
export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <PiggyBank size={22} />
        </div>
        <div>
          <strong>FINORA</strong>
          <span>Your money, clearly.</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        className="logout-button"
        onClick={() => {
          clearSession();
          navigate("/login");
        }}
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
