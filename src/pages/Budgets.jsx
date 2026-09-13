import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";
import ProgressBar from "../components/ProgressBar";
export default function Budgets() {
  const now = new Date();
  const [items, setItems] = useState(null),
    [cats, setCats] = useState([]),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const [form, setForm] = useState({
    category_id: "",
    amount: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  async function load() {
    const [b, c] = await Promise.all([
      apiFetch(`/budgets?month=${form.month}&year=${form.year}`),
      apiFetch("/categories?type=expense"),
    ]);
    setItems(b.budgets || []);
    setCats(c.categories || []);
    if (!form.category_id && c.categories?.[0])
      setForm((f) => ({ ...f, category_id: String(c.categories[0].id) }));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      await apiFetch("/budgets", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          amount: Number(form.amount),
          month: Number(form.month),
          year: Number(form.year),
        }),
      });
      setShow(false);
      setForm((f) => ({ ...f, amount: "" }));
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  if (!items) return <div className="loading-state">Loading budgets...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Plan your spending</span>
          <h1>Budgets</h1>
          <p>Set monthly limits by category.</p>
        </div>
        <button className="primary-button" onClick={() => setShow(!show)}>
          <Plus size={18} />
          New budget
        </button>
      </section>
      {error && <div className="auth-error">{error}</div>}
      {show && (
        <form className="panel form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Category
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Monthly limit
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>
          </div>
          <button className="primary-button">Create budget</button>
        </form>
      )}
      <section className="cards-grid">
        {items.length ? (
          items.map((b) => (
            <article className="panel budget-card" key={b.id}>
              <div className="row-between">
                <div>
                  <span className="eyebrow">Category</span>
                  <h3>{b.category?.name}</h3>
                </div>
                <strong>{Math.round(b.percentage)}%</strong>
              </div>
              <ProgressBar value={b.percentage} />
              <div className="row-between muted">
                <span>{formatCurrency(b.spent)} spent</span>
                <span>{formatCurrency(b.amount)} limit</span>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">No budgets yet.</div>
        )}
      </section>
    </div>
  );
}
