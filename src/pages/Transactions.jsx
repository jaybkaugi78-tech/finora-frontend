import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { formatCurrency, formatDate } from "../utils/currency";
export default function Transactions() {
  const [items, setItems] = useState(null),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  const load = (q = "") =>
    apiFetch(
      `/transactions${q ? `?search=${encodeURIComponent(q)}` : ""}`,
    ).then((d) => setItems(d.transactions || []));
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function del(id) {
    if (!confirm("Delete this transaction?")) return;
    await apiFetch(`/transactions/${id}`, { method: "DELETE" });
    await load(search);
  }
  if (!items)
    return <div className="loading-state">Loading transactions...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Money movement</span>
          <h1>Transactions</h1>
          <p>Every shilling, clearly tracked.</p>
        </div>
        <Link className="primary-button" to="/transactions/new">
          <Plus size={18} />
          Add transaction
        </Link>
      </section>
      {error && <div className="auth-error">{error}</div>}
      <section className="panel">
        <form
          className="toolbar"
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
        >
          <div className="toolbar-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>
          <button className="secondary-button">Search</button>
        </form>
        {items.length ? (
          items.map((t) => (
            <div className="transaction-row" key={t.id}>
              <div className="transaction-left">
                <div>
                  <strong>
                    {t.merchant || t.description || t.transaction_type}
                  </strong>
                  <span>
                    {t.category?.name || t.transaction_type} ·{" "}
                    {formatDate(t.transaction_date)}
                  </span>
                </div>
              </div>
              <div className="transaction-right">
                <strong
                  className={t.transaction_type === "income" ? "income" : ""}
                >
                  {t.transaction_type === "income"
                    ? "+"
                    : t.transaction_type === "expense"
                      ? "-"
                      : ""}
                  {formatCurrency(t.amount)}
                </strong>
                <button className="text-danger" onClick={() => del(t.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No transactions found.</div>
        )}
      </section>
    </div>
  );
}
