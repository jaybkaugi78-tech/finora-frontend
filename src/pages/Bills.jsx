import { BellRing, Plus } from "lucide-react";
import { bills } from "../data/mockData";
import { money } from "../utils/currency";
export default function Bills() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Upcoming commitments</span>
          <h1>Bills & subscriptions</h1>
          <p>Stay ahead of recurring payments and due dates.</p>
        </div>
        <button className="primary">
          <Plus size={18} />
          Add bill
        </button>
      </section>
      <section className="cards">
        {bills.map((b) => (
          <article className="panel account" key={b.id}>
            <div className="round-icon">
              <BellRing size={20} />
            </div>
            <div>
              <span className="eyebrow">Upcoming</span>
              <h3>{b.name}</h3>
              <small>Due {b.due}</small>
            </div>
            <strong>{money(b.amount)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}
