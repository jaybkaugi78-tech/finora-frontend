import {
  BarChart3,
  BellRing,
  CircleDollarSign,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";
const links = [
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
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="safe-mini">
        <span>Safe to spend</span>
        <strong>KSh 13,650</strong>
      </div>
    </aside>
  );
}
