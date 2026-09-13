import { money } from "../utils/currency";
export default function TransactionList({ items }) {
  return (
    <div className="tx-list">
      {items.map((t) => (
        <div className="tx" key={t.id}>
          <div>
            <strong>{t.name}</strong>
            <span>
              {t.category} · {t.account}
            </span>
          </div>
          <div className="tx-right">
            <strong className={t.amount > 0 ? "income" : ""}>
              {t.amount > 0 ? "+" : "-"}
              {money(Math.abs(t.amount))}
            </strong>
            <span>{t.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
