import { useEffect, useState } from "react";
import { Plus, Target } from "lucide-react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";
import ProgressBar from "../components/ProgressBar";
export default function Goals() {
  const [items, setItems] = useState(null),
    [show, setShow] = useState(false),
    [active, setActive] = useState(null),
    [amount, setAmount] = useState(""),
    [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    target_date: "",
    notes: "",
  });
  const load = () => apiFetch("/goals").then((d) => setItems(d.goals || []));
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function create(e) {
    e.preventDefault();
    try {
      await apiFetch("/goals", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          target_amount: Number(form.target_amount),
          target_date: form.target_date || null,
        }),
      });
      setShow(false);
      setForm({ name: "", target_amount: "", target_date: "", notes: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function contribute(e) {
    e.preventDefault();
    try {
      await apiFetch(`/goals/${active.id}/contributions`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      setActive(null);
      setAmount("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  if (!items) return <div className="loading-state">Loading goals...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Build your future</span>
          <h1>Savings goals</h1>
          <p>Turn plans into measurable progress.</p>
        </div>
        <button className="primary-button" onClick={() => setShow(!show)}>
          <Plus size={18} />
          New goal
        </button>
      </section>
      {error && <div className="auth-error">{error}</div>}
      {show && (
        <form className="panel form-card" onSubmit={create}>
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
              Target amount
              <input
                type="number"
                value={form.target_amount}
                onChange={(e) =>
                  setForm({ ...form, target_amount: e.target.value })
                }
                required
              />
            </label>
            <label>
              Target date
              <input
                type="date"
                value={form.target_date}
                onChange={(e) =>
                  setForm({ ...form, target_date: e.target.value })
                }
              />
            </label>
            <label>
              Notes
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
          <button className="primary-button">Create goal</button>
        </form>
      )}
      {active && (
        <form className="panel form-card" onSubmit={contribute}>
          <h3>Add money to {active.name}</h3>
          <div className="inline-form">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
            />
            <button className="primary-button">Add contribution</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setActive(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <section className="cards-grid">
        {items.length ? (
          items.map((g) => (
            <article className="panel goal-card" key={g.id}>
              <div className="goal-icon">
                <Target size={22} />
              </div>
              <span className="eyebrow">
                {g.target_date ? `Target ${g.target_date}` : "No target date"}
              </span>
              <h3>{g.name}</h3>
              <strong className="goal-amount">
                {formatCurrency(g.saved_amount)}
              </strong>
              <small>of {formatCurrency(g.target_amount)}</small>
              <ProgressBar value={g.percentage} />
              <div className="row-between muted">
                <span>{Math.round(g.percentage)}% complete</span>
                <span>{formatCurrency(g.remaining)} left</span>
              </div>
              <button
                className="secondary-button full-button"
                onClick={() => setActive(g)}
              >
                Add money
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state">No goals yet.</div>
        )}
      </section>
    </div>
  );
}
