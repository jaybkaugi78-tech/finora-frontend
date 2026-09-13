import { useEffect, useState } from "react";
import { BellRing, Plus } from "lucide-react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";
export default function Bills() {
  const [items, setItems] = useState(null),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    next_due_date: "",
    frequency: "monthly",
    reminder_days: 3,
    is_subscription: false,
  });
  const load = () => apiFetch("/bills").then((d) => setItems(d.bills || []));
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      await apiFetch("/bills", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          reminder_days: Number(form.reminder_days),
        }),
      });
      setShow(false);
      setForm({
        name: "",
        amount: "",
        next_due_date: "",
        frequency: "monthly",
        reminder_days: 3,
        is_subscription: false,
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  if (!items) return <div className="loading-state">Loading bills...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Upcoming commitments</span>
          <h1>Bills & subscriptions</h1>
          <p>Know what is due before it surprises you.</p>
        </div>
        <button className="primary-button" onClick={() => setShow(!show)}>
          <Plus size={18} />
          Add bill
        </button>
      </section>
      {error && <div className="auth-error">{error}</div>}
      {show && (
        <form className="panel form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>
            <label>
              Next due date
              <input
                type="date"
                value={form.next_due_date}
                onChange={(e) =>
                  setForm({ ...form, next_due_date: e.target.value })
                }
                required
              />
            </label>
            <label>
              Frequency
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
            <label>
              Reminder days
              <input
                type="number"
                value={form.reminder_days}
                onChange={(e) =>
                  setForm({ ...form, reminder_days: e.target.value })
                }
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.is_subscription}
                onChange={(e) =>
                  setForm({ ...form, is_subscription: e.target.checked })
                }
              />{" "}
              Subscription
            </label>
          </div>
          <button className="primary-button">Save bill</button>
        </form>
      )}
      <section className="cards-grid">
        {items.length ? (
          items.map((b) => (
            <article className="panel bill-card" key={b.id}>
              <div className="bill-icon">
                <BellRing size={20} />
              </div>
              <div className="bill-content">
                <span className="eyebrow">
                  {b.is_subscription ? "Subscription" : b.frequency}
                </span>
                <h3>{b.name}</h3>
                <small>Due {b.next_due_date}</small>
              </div>
              <strong>{formatCurrency(b.amount)}</strong>
            </article>
          ))
        ) : (
          <div className="empty-state">No bills yet.</div>
        )}
      </section>
    </div>
  );
}
