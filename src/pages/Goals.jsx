import { Plus, Target } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import { goals } from "../data/mockData";
import { money } from "../utils/currency";
export default function Goals() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Build your future</span>
          <h1>Savings goals</h1>
          <p>Turn plans into measurable milestones.</p>
        </div>
        <button className="primary">
          <Plus size={18} />
          New goal
        </button>
      </section>
      <section className="cards">
        {goals.map((g) => {
          const p = Math.round((g.saved / g.target) * 100);
          return (
            <article className="panel goal" key={g.id}>
              <div className="round-icon">
                <Target size={20} />
              </div>
              <span className="eyebrow">Target {g.targetDate}</span>
              <h3>{g.name}</h3>
              <strong className="big-number">{money(g.saved)}</strong>
              <small>of {money(g.target)}</small>
              <ProgressBar value={p} />
              <div className="row muted">
                <span>{p}% complete</span>
                <span>{money(g.target - g.saved)} left</span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
