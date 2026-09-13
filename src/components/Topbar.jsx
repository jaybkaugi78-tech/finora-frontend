import { Bell, Search } from "lucide-react";
export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search">
        <Search size={18} />
        <input placeholder="Search transactions, bills, goals..." />
      </div>
      <div className="profile">
        <button className="icon-btn">
          <Bell size={18} />
        </button>
        <div className="avatar">J</div>
        <div>
          <strong>Jay</strong>
          <span>Personal</span>
        </div>
      </div>
    </header>
  );
}
