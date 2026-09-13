import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
export default function Notifications() {
  const [items, setItems] = useState(null);
  const load = () =>
    apiFetch("/notifications").then((d) => setItems(d.notifications || []));
  useEffect(() => {
    load();
  }, []);
  if (!items)
    return <div className="loading-state">Loading notifications...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Finora alerts</span>
          <h1>Notifications</h1>
          <p>Your money reminders live here.</p>
        </div>
      </section>
      <section className="panel">
        {items.length ? (
          items.map((n) => (
            <button
              className={`notification-row ${n.is_read ? "read" : ""}`}
              key={n.id}
              onClick={async () => {
                await apiFetch(`/notifications/${n.id}/read`, {
                  method: "PATCH",
                });
                await load();
              }}
            >
              <div>
                <strong>{n.title}</strong>
                <span>{n.message}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="empty-state">You’re all caught up.</div>
        )}
      </section>
    </div>
  );
}
