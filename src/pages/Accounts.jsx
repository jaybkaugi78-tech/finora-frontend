import { useEffect, useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";
export default function Accounts() {
  const [accounts, setAccounts] = useState(null),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    account_type: "mobile_money",
    balance: "",
  });
  const load = () =>
    apiFetch("/accounts").then((d) => setAccounts(d.accounts || []));
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify({ ...form, balance: Number(form.balance || 0) }),
      });
      setShow(false);
      setForm({ name: "", account_type: "mobile_money", balance: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  if (!accounts)
    return <div className="loading-state">Loading accounts...</div>;
  const total = accounts
    .filter((a) => !a.is_archived)
    .reduce((s, a) => s + Number(a.balance), 0);
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Where your money lives</span>
          <h1>Accounts</h1>
          <p>M-Pesa, bank, cash and savings in one place.</p>
        </div>
        <button className="primary-button" onClick={() => setShow(!show)}>
          <Plus size={18} />
          Add account
        </button>
      </section>
      {error && <div className="auth-error">{error}</div>}
      {show && (
        <form className="panel form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Type
              <select
                value={form.account_type}
                onChange={(e) =>
                  setForm({ ...form, account_type: e.target.value })
                }
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="savings">Savings</option>
              </select>
            </label>
            <label>
              Opening balance
              <input
                type="number"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </label>
          </div>
          <button className="primary-button">Create account</button>
        </form>
      )}
      <section className="hero-balance compact">
        <div>
          <span>Total across accounts</span>
          <h2>{formatCurrency(total)}</h2>
          <p>{accounts.length} accounts</p>
        </div>
      </section>
      <section className="cards-grid">
        {accounts.map((a) => (
          <article className="panel account-card" key={a.id}>
            <div className="account-icon">
              <WalletCards size={21} />
            </div>
            <div>
              <span className="eyebrow">
                {a.account_type.replace("_", " ")}
              </span>
              <h3>{a.name}</h3>
            </div>
            <strong>{formatCurrency(a.balance, a.currency)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}
