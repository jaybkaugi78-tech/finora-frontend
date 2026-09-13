import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";
export default function Analytics() {
  const [trend, setTrend] = useState(null),
    [cats, setCats] = useState([]);
  useEffect(() => {
    Promise.all([
      apiFetch("/analytics/monthly-trend"),
      apiFetch("/analytics/spending-by-category"),
    ]).then(([t, c]) => {
      setTrend(t.trend || []);
      setCats(c.categories || []);
    });
  }, []);
  if (!trend) return <div className="loading-state">Loading analytics...</div>;
  const max = Math.max(1, ...trend.map((x) => Number(x.expenses)));
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Understand your habits</span>
          <h1>Analytics</h1>
          <p>See the patterns behind your money.</p>
        </div>
      </section>
      <section className="analytics-grid">
        <article className="panel panel-large">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">6-month view</span>
              <h3>Monthly spending</h3>
            </div>
          </div>
          <div className="bar-chart">
            {trend.map((x) => (
              <div className="bar-column" key={`${x.year}-${x.month}`}>
                <div className="bar-wrap">
                  <span
                    className="bar"
                    style={{ height: `${(Number(x.expenses) / max) * 100}%` }}
                  />
                </div>
                <strong>
                  {new Date(x.year, x.month - 1, 1).toLocaleString("en", {
                    month: "short",
                  })}
                </strong>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <span className="eyebrow">Current month</span>
          <h3>Income</h3>
          <div className="insight-number">
            {formatCurrency(trend.at(-1)?.income || 0)}
          </div>
        </article>
        <article className="panel">
          <span className="eyebrow">Current month</span>
          <h3>Expenses</h3>
          <div className="insight-number">
            {formatCurrency(trend.at(-1)?.expenses || 0)}
          </div>
        </article>
      </section>
      <section className="panel analytics-category-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Categories</span>
            <h3>Spending breakdown</h3>
          </div>
        </div>
        {cats.length ? (
          cats.map((c) => (
            <div className="mini-row" key={c.category_id}>
              <strong>{c.name}</strong>
              <strong>{formatCurrency(c.spent)}</strong>
            </div>
          ))
        ) : (
          <div className="empty-state">No spending data yet.</div>
        )}
      </section>
    </div>
  );
}
