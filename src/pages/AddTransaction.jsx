import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
export default function AddTransaction() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]),
    [categories, setCategories] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    transaction_type: "expense",
    amount: "",
    account_id: "",
    destination_account_id: "",
    category_id: "",
    merchant: "",
    description: "",
    notes: "",
    transaction_date: new Date().toISOString().slice(0, 16),
  });
  useEffect(() => {
    Promise.all([apiFetch("/accounts"), apiFetch("/categories")])
      .then(([a, c]) => {
        const active = (a.accounts || []).filter((x) => !x.is_archived);
        setAccounts(active);
        setCategories(c.categories || []);
        if (active[0])
          setForm((f) => ({ ...f, account_id: String(active[0].id) }));
      })
      .catch((e) => setError(e.message));
  }, []);
  const filtered = useMemo(
    () => categories.filter((c) => c.category_type === form.transaction_type),
    [categories, form.transaction_type],
  );
  useEffect(() => {
    if (form.transaction_type !== "transfer" && filtered[0])
      setForm((f) => ({ ...f, category_id: String(filtered[0].id) }));
  }, [form.transaction_type, categories]);
  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          account_id: Number(form.account_id),
          destination_account_id:
            form.transaction_type === "transfer"
              ? Number(form.destination_account_id)
              : null,
          category_id:
            form.transaction_type === "transfer"
              ? null
              : Number(form.category_id),
          transaction_date: new Date(form.transaction_date).toISOString(),
        }),
      });
      navigate("/transactions");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="page-content narrow-page">
      <section className="page-heading">
        <div>
          <Link className="back-link" to="/transactions">
            <ArrowLeft size={16} />
            Transactions
          </Link>
          <span className="eyebrow">Record money movement</span>
          <h1>Add transaction</h1>
        </div>
      </section>
      {error && <div className="auth-error">{error}</div>}
      <form className="panel form-card" onSubmit={submit}>
        <div className="type-tabs">
          {["expense", "income", "transfer"].map((type) => (
            <button
              type="button"
              key={type}
              className={form.transaction_type === type ? "active" : ""}
              onClick={() =>
                setForm({
                  ...form,
                  transaction_type: type,
                  category_id: "",
                  destination_account_id: "",
                })
              }
            >
              {type}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <label className="form-span-2">
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>
          <label>
            From account
            <select
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          {form.transaction_type === "transfer" ? (
            <label>
              To account
              <select
                value={form.destination_account_id}
                onChange={(e) =>
                  setForm({ ...form, destination_account_id: e.target.value })
                }
                required
              >
                <option value="">Choose destination</option>
                {accounts
                  .filter((a) => String(a.id) !== String(form.account_id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <label>
              Category
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                {filtered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Merchant
            <input
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            />
          </label>
          <label>
            Date
            <input
              type="datetime-local"
              value={form.transaction_date}
              onChange={(e) =>
                setForm({ ...form, transaction_date: e.target.value })
              }
            />
          </label>
          <label className="form-span-2">
            Description
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="form-span-2">
            Notes
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        <button className="primary-button" disabled={loading}>
          {loading ? "Saving..." : "Save transaction"}
        </button>
      </form>
    </div>
  );
}
