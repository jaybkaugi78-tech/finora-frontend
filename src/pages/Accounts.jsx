import { Plus, WalletCards } from "lucide-react";
import { accounts } from "../data/mockData";
import { money } from "../utils/currency";
export default function Accounts() {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Where your money lives</span>
          <h1>Accounts</h1>
          <p>Keep mobile money, bank, cash and savings in one view.</p>
        </div>
        <button className="primary">
          <Plus size={18} />
          Add account
        </button>
      </section>
      <section className="balance-card compact">
        <div>
          <span>Total across accounts</span>
          <h2>{money(total)}</h2>
          <p>4 active accounts</p>
        </div>
      </section>
      <section className="cards">
        {accounts.map((a) => (
          <article className="panel account" key={a.id}>
            <div className="round-icon">
              <WalletCards size={20} />
            </div>
            <div>
              <span className="eyebrow">{a.type}</span>
              <h3>{a.name}</h3>
            </div>
            <strong>{money(a.balance)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}
