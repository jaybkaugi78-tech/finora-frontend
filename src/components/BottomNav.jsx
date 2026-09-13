import {
  Home,
  ReceiptText,
  WalletCards,
  Target,
  MoreHorizontal,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <ReceiptText size={20} />
        <span>Transactions</span>
      </NavLink>

      <NavLink
        to="/budgets"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <WalletCards size={20} />
        <span>Budgets</span>
      </NavLink>

      <NavLink
        to="/goals"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <Target size={20} />
        <span>Goals</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <MoreHorizontal size={20} />
        <span>More</span>
      </NavLink>
    </nav>
  );
}