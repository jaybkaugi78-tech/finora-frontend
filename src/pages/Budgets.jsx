import { Plus } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import { budgets } from "../data/mockData";
import { money } from "../utils/currency";
export default function Budgets() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">September 2026</span>
          <h1>Budgets</h1>
          <p>
            Set spending boundaries without losing sight of your bigger goals.
          </p>
        </div>
        <button className="primary">
          <Plus size={18} />
          New budget
        </button>
      </section>
      <section className="panel budget-summary">
        <div>
          <span className="eyebrow">Total monthly budget</span>
          <h2>KSh 16,500</h2>
          <p>KSh 10,670 spent so far</p>
        </div>
        <div className="circle-stat">
          <strong>65%</strong>
          <span>used</span>
        </div>
      </section>
      <section className="cards">
        {budgets.map((b) => {
          const p = Math.round((b.spent / b.limit) * 100);
          return (
            <article className="panel" key={b.id}>
              <div className="row">
                <h3>{b.name}</h3>
                <strong>{p}%</strong>
              </div>
              <ProgressBar value={p} />
              <div className="row muted">
                <span>{money(b.spent)} spent</span>
                <span>{money(b.limit)} limit</span>
              </div>
              {p >= 90 && <div className="warn">Approaching limit</div>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
