import { ArrowDownRight, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import TransactionList from "../components/TransactionList";
import ProgressBar from "../components/ProgressBar";
import { transactions, budgets, goals } from "../data/mockData";
import { money } from "../utils/currency";
export default function Dashboard() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">September 2026</span>
          <h1>Good evening, Jay.</h1>
          <p>Here’s what your money is doing today.</p>
        </div>
        <button className="primary">
          <Plus size={18} />
          Add transaction
        </button>
      </section>
      <section className="balance-card">
        <div>
          <span>Available balance</span>
          <h2>KSh 18,450</h2>
          <div className="balance-meta">
            <span>
              <ArrowUpRight size={15} />
              KSh 32,000 income
            </span>
            <span>
              <ArrowDownRight size={15} />
              KSh 13,550 spent
            </span>
          </div>
        </div>
        <div className="safe-card">
          <Sparkles />
          <div>
            <span>Safe to spend</span>
            <strong>KSh 13,650</strong>
            <small>After upcoming commitments</small>
          </div>
        </div>
      </section>
      <section className="stats">
        <div className="stat">
          <span>Income</span>
          <strong>KSh 32,000</strong>
          <small>+8.4% vs last month</small>
        </div>
        <div className="stat">
          <span>Expenses</span>
          <strong>KSh 13,550</strong>
          <small>42% of monthly income</small>
        </div>
        <div className="stat">
          <span>Saved</span>
          <strong>KSh 6,200</strong>
          <small>19.4% savings rate</small>
        </div>
        <div className="stat">
          <span>Upcoming bills</span>
          <strong>KSh 9,850</strong>
          <small>3 payments due</small>
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="panel transactions-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Recent activity</span>
              <h3>Transactions</h3>
            </div>
          </div>
          <TransactionList items={transactions.slice(0, 5)} />
        </article>
        <article className="panel">
          <span className="eyebrow">This month</span>
          <h3>Budget overview</h3>
          <div className="stack">
            {budgets.slice(0, 3).map((b) => {
              const p = (b.spent / b.limit) * 100;
              return (
                <div key={b.id}>
                  <div className="row">
                    <strong>{b.name}</strong>
                    <span>{Math.round(p)}%</span>
                  </div>
                  <ProgressBar value={p} />
                  <small>
                    {money(b.spent)} of {money(b.limit)}
                  </small>
                </div>
              );
            })}
          </div>
        </article>
        <article className="panel">
          <span className="eyebrow">Savings</span>
          <h3>Goals</h3>
          <div className="stack">
            {goals.slice(0, 2).map((g) => {
              const p = (g.saved / g.target) * 100;
              return (
                <div key={g.id}>
                  <div className="row">
                    <strong>{g.name}</strong>
                    <span>{Math.round(p)}%</span>
                  </div>
                  <ProgressBar value={p} />
                  <small>{money(g.saved)} saved</small>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

