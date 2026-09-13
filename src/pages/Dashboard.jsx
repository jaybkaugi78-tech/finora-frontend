import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch, getStoredUser } from "../services/api";
import { formatCurrency, formatDate } from "../utils/currency";
export default function Dashboard() {
  const user = getStoredUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    apiFetch("/analytics/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  if (!data && !error)
    return <div className="loading-state">Loading Finora...</div>;
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Your financial overview</span>
          <h1>Good to see you, {user?.full_name?.split(" ")[0] || "there"}.</h1>
          <p>Your dashboard is powered by real data.</p>
        </div>
        <Link className="primary-button" to="/transactions/new">
          <Plus size={18} />
          Add transaction
        </Link>
      </section>
      {error ? (
        <div className="auth-error">{error}</div>
      ) : (
        <>
          <section className="hero-balance">
            <div className="hero-balance-main">
              <span>Available balance</span>
              <h2>{formatCurrency(data.available_balance)}</h2>
              <div className="hero-balance-meta">
                <span>
                  <ArrowUpRight size={16} />
                  {formatCurrency(data.income_this_month)} income
                </span>
                <span>
                  <ArrowDownRight size={16} />
                  {formatCurrency(data.expenses_this_month)} spent
                </span>
              </div>
            </div>
            <div className="safe-spend-card">
              <div className="safe-spend-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <span>Safe to spend</span>
                <strong>{formatCurrency(data.safe_to_spend)}</strong>
                <small>After upcoming bills</small>
              </div>
            </div>
          </section>
          <section className="stats-grid">
            <article className="stat-card success">
              <span className="eyebrow">Income</span>
              <strong>{formatCurrency(data.income_this_month)}</strong>
              <small>This month</small>
            </article>
            <article className="stat-card">
              <span className="eyebrow">Expenses</span>
              <strong>{formatCurrency(data.expenses_this_month)}</strong>
              <small>This month</small>
            </article>
            <article className="stat-card warning">
              <span className="eyebrow">Upcoming</span>
              <strong>{formatCurrency(data.upcoming_bills)}</strong>
              <small>Next 30 days</small>
            </article>
            <article className="stat-card">
              <span className="eyebrow">Transactions</span>
              <strong>{data.recent_transactions?.length || 0}</strong>
              <small>Recent entries</small>
            </article>
          </section>
          <section className="dashboard-grid">
            <article className="panel panel-large">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Recent activity</span>
                  <h3>Transactions</h3>
                </div>
                <Link className="ghost-button" to="/transactions">
                  View all
                </Link>
              </div>
              {data.recent_transactions?.length ? (
                data.recent_transactions.map((t) => (
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
                        className={
                          t.transaction_type === "income" ? "income" : ""
                        }
                      >
                        {t.transaction_type === "income"
                          ? "+"
                          : t.transaction_type === "expense"
                            ? "-"
                            : ""}
                        {formatCurrency(t.amount)}
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No transactions yet.</div>
              )}
            </article>
            <article className="panel">
              <span className="eyebrow">Next step</span>
              <h3>Make Finora yours</h3>
              <p className="muted">
                Add your real accounts, then record income, spending, goals and
                bills.
              </p>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
