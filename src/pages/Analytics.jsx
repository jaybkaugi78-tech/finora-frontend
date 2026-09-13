import { trend } from "../data/mockData";
import { money } from "../utils/currency";
export default function Analytics() {
  const max = Math.max(...trend.map((x) => x.v));
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Understand your habits</span>
          <h1>Analytics</h1>
          <p>See the patterns behind your spending, savings and income.</p>
        </div>
      </section>
      <section className="analytics">
        <article className="panel chart-panel">
          <span className="eyebrow">6-month view</span>
          <h3>Monthly spending</h3>
          <div className="chart">
            {trend.map((x) => (
              <div className="bar-col" key={x.m}>
                <div className="bar-track">
                  <span style={{ height: `${(x.v / max) * 100}%` }} />
                </div>
                <strong>{x.m}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="panel insight">
          <span className="eyebrow">Insight</span>
          <h3>You’re spending less.</h3>
          <p>September spending is currently 21% lower than August.</p>
          <strong className="big-number">{money(3650)}</strong>
          <small>less than last month</small>
        </article>
        <article className="panel insight">
          <span className="eyebrow">Largest category</span>
          <h3>Food</h3>
          <strong className="big-number">32%</strong>
          <small>of monthly expenses</small>
        </article>
      </section>
    </div>
  );
}
