import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";

export default function Analytics() {
  const [trend, setTrend] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/analytics/monthly-trend"),
      apiFetch("/analytics/spending-by-category"),
    ])
      .then(([trendData, categoryData]) => {
        setTrend(trendData.trend || []);
        setCategories(categoryData.categories || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (!trend && !error) {
    return <div className="loading-state">Loading analytics...</div>;
  }

  const maxExpense = Math.max(
    1,
    ...(trend || []).map((item) => Number(item.expenses || 0))
  );
  const currentMonth = trend?.at(-1);

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Understand your habits</span>
          <h1>Analytics</h1>
          <p>See the patterns behind your money.</p>
        </div>
      </section>

      {error && <div className="auth-error">{error}</div>}

      {!error && (
        <>
          <section className="analytics-grid">
            <article className="panel panel-large">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">6-month view</span>
                  <h3>Monthly spending</h3>
                </div>
              </div>

              {trend.length ? (
                <div className="bar-chart">
                  {trend.map((item) => {
                    const height = (Number(item.expenses || 0) / maxExpense) * 100;
                    const month = new Date(
                      item.year,
                      item.month - 1,
                      1
                    ).toLocaleString("en", { month: "short" });

                    return (
                      <div className="bar-column" key={`${item.year}-${item.month}`}>
                        <div className="bar-wrap">
                          <span className="bar" style={{ height: `${height}%` }} />
                        </div>
                        <strong>{month}</strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">No analytics data yet.</div>
              )}
            </article>

            <article className="panel">
              <span className="eyebrow">Current month</span>
              <h3>Income</h3>
              <div className="insight-number">
                {formatCurrency(currentMonth?.income || 0)}
              </div>
            </article>

            <article className="panel">
              <span className="eyebrow">Current month</span>
              <h3>Expenses</h3>
              <div className="insight-number">
                {formatCurrency(currentMonth?.expenses || 0)}
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

            {categories.length ? (
              categories.map((category) => (
                <div className="mini-row" key={category.category_id}>
                  <strong>{category.name}</strong>
                  <strong>{formatCurrency(category.spent)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state">No spending data yet.</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
