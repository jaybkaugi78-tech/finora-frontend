import { useEffect, useState } from "react";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CreditCard,
  Plus,
  ReceiptText,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { Link } from "react-router-dom";

import { apiFetch, getStoredUser } from "../services/api";

import { formatCurrency, formatDate } from "../utils/currency";

function ProgressBar({ percentage = 0, danger = false }) {
  const width = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  return (
    <div className={`dashboard-progress ${danger ? "danger" : ""}`}>
      <span
        style={{
          width: `${width}%`,
        }}
      />
    </div>
  );
}

function dueText(days) {
  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `Due in ${days} days`;
}

export default function Dashboard() {
  const user = getStoredUser();

  const [data, setData] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/analytics/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (!data && !error) {
    return <div className="loading-state">Loading Finora...</div>;
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Your financial overview</span>

          <h1>Good to see you, {user?.full_name?.split(" ")[0] || "there"}.</h1>

          <p>Here's what's happening with your money.</p>
        </div>

        <div className="dashboard-heading-actions">
          {data?.unread_notifications > 0 && (
            <Link className="dashboard-notification-button" to="/notifications">
              <Bell size={17} />

              <span>{data.unread_notifications}</span>
            </Link>
          )}

          <Link className="primary-button" to="/transactions/new">
            <Plus size={18} />
            Add transaction
          </Link>
        </div>
      </section>

      {error ? (
        <div className="auth-error">{error}</div>
      ) : (
        <>
          <section className="hero-balance">
            <div className="hero-balance-main">
              <span>Available balance</span>

              <h2>{formatCurrency(data.available_balance)}</h2>

              <div className="hero-balance-meta">
                <span>
                  <ArrowUpRight size={16} />
                  {formatCurrency(data.income_this_month)} income
                </span>

                <span>
                  <ArrowDownRight size={16} />
                  {formatCurrency(data.expenses_this_month)} spent
                </span>
              </div>
            </div>

            <div className="safe-spend-card">
              <div className="safe-spend-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <span>Safe to spend</span>

                <strong>{formatCurrency(data.safe_to_spend)}</strong>

                <small>After upcoming bills</small>
              </div>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card success">
              <span className="eyebrow">Net cash flow</span>

              <strong>{formatCurrency(data.net_cash_flow)}</strong>

              <small>Income minus expenses</small>
            </article>

            <article className="stat-card">
              <span className="eyebrow">Savings rate</span>

              <strong>{Number(data.savings_rate || 0).toFixed(1)}%</strong>

              <small>This month</small>
            </article>

            <article className="stat-card warning">
              <span className="eyebrow">Upcoming bills</span>

              <strong>{formatCurrency(data.upcoming_bills)}</strong>

              <small>Next 30 days</small>
            </article>

            <article className="stat-card">
              <span className="eyebrow">Transactions</span>

              <strong>{data.transaction_count || 0}</strong>

              <small>This month</small>
            </article>
          </section>

          <section className="dashboard-overview-grid">
            <article className="panel dashboard-budget-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Monthly plan</span>

                  <h3>Budget health</h3>
                </div>

                <Link className="ghost-button" to="/budgets">
                  View budgets
                </Link>
              </div>

              {data.budgets?.length ? (
                <>
                  <div className="dashboard-budget-summary">
                    <div>
                      <span>Spent</span>

                      <strong>
                        {formatCurrency(data.budget_summary.spent)}
                      </strong>
                    </div>

                    <div>
                      <span>Budgeted</span>

                      <strong>
                        {formatCurrency(data.budget_summary.total_budget)}
                      </strong>
                    </div>

                    <div>
                      <span>Remaining</span>

                      <strong>
                        {formatCurrency(data.budget_summary.remaining)}
                      </strong>
                    </div>
                  </div>

                  <ProgressBar
                    percentage={data.budget_summary.percentage}
                    danger={data.budget_summary.percentage > 100}
                  />

                  <div className="dashboard-budget-list">
                    {data.budgets.map((budget) => (
                      <div className="dashboard-budget-item" key={budget.id}>
                        <div>
                          <strong>{budget.category?.name || "Budget"}</strong>

                          <span>
                            {formatCurrency(budget.spent)} of{" "}
                            {formatCurrency(budget.amount)}
                          </span>
                        </div>

                        <strong
                          className={
                            budget.is_over_budget ? "dashboard-danger-text" : ""
                          }
                        >
                          {Number(budget.percentage).toFixed(0)}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="dashboard-empty-block">
                  <ReceiptText size={24} />

                  <div>
                    <strong>No budgets yet</strong>

                    <span>
                      Create a budget to start tracking your monthly spending.
                    </span>
                  </div>

                  <Link to="/budgets" className="ghost-button">
                    Create budget
                  </Link>
                </div>
              )}
            </article>

            <article className="panel dashboard-goals-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Progress</span>

                  <h3>Savings goals</h3>
                </div>

                <Link className="ghost-button" to="/goals">
                  View all
                </Link>
              </div>

              {data.goals?.length ? (
                <div className="dashboard-goal-list">
                  {data.goals.map((goal) => (
                    <div className="dashboard-goal-item" key={goal.id}>
                      <div className="dashboard-goal-heading">
                        <div className="dashboard-mini-icon">
                          <Target size={16} />
                        </div>

                        <div>
                          <strong>{goal.name}</strong>

                          <span>{formatCurrency(goal.saved_amount)} saved</span>
                        </div>

                        <strong>{Number(goal.percentage).toFixed(0)}%</strong>
                      </div>

                      <ProgressBar percentage={goal.percentage} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-block">
                  <Target size={24} />

                  <div>
                    <strong>No active goals</strong>

                    <span>
                      Create a savings goal and track your progress here.
                    </span>
                  </div>

                  <Link className="ghost-button" to="/goals">
                    Add goal
                  </Link>
                </div>
              )}
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel panel-large">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Recent activity</span>

                  <h3>Transactions</h3>
                </div>

                <Link className="ghost-button" to="/transactions">
                  View all
                </Link>
              </div>

              {data.recent_transactions?.length ? (
                data.recent_transactions.map((transaction) => (
                  <div className="transaction-row" key={transaction.id}>
                    <div className="transaction-left">
                      <div className="dashboard-transaction-icon">
                        {transaction.transaction_type === "income" ? (
                          <ArrowUpRight size={17} />
                        ) : transaction.transaction_type === "expense" ? (
                          <ArrowDownRight size={17} />
                        ) : (
                          <ArrowRight size={17} />
                        )}
                      </div>

                      <div>
                        <strong>
                          {transaction.merchant ||
                            transaction.description ||
                            transaction.transaction_type}
                        </strong>

                        <span>
                          {transaction.category?.name ||
                            transaction.transaction_type}

                          {" · "}

                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>
                    </div>

                    <div className="transaction-right">
                      <strong
                        className={
                          transaction.transaction_type === "income"
                            ? "income"
                            : ""
                        }
                      >
                        {transaction.transaction_type === "income"
                          ? "+"
                          : transaction.transaction_type === "expense"
                            ? "-"
                            : ""}

                        {formatCurrency(transaction.amount)}
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No transactions yet.</div>
              )}
            </article>

            <article className="panel dashboard-bills-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Coming up</span>

                  <h3>Bills</h3>
                </div>

                <Link className="ghost-button" to="/bills">
                  View all
                </Link>
              </div>

              {data.upcoming_bill_items?.length ? (
                <div className="dashboard-bill-list">
                  {data.upcoming_bill_items.map((bill) => (
                    <div className="dashboard-bill-item" key={bill.id}>
                      <div className="dashboard-mini-icon">
                        <CalendarDays size={16} />
                      </div>

                      <div>
                        <strong>{bill.name}</strong>

                        <span>{dueText(bill.days_until_due)}</span>
                      </div>

                      <strong>{formatCurrency(bill.amount)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-block compact">
                  <CalendarDays size={23} />

                  <div>
                    <strong>No bills due soon</strong>

                    <span>Nothing scheduled within the next 30 days.</span>
                  </div>
                </div>
              )}
            </article>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="panel dashboard-accounts-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Your money</span>

                  <h3>Accounts</h3>
                </div>

                <Link className="ghost-button" to="/accounts">
                  Manage
                </Link>
              </div>

              {data.accounts?.length ? (
                <div className="dashboard-account-list">
                  {data.accounts.map((account) => (
                    <div className="dashboard-account-item" key={account.id}>
                      <div className="dashboard-mini-icon">
                        <WalletCards size={16} />
                      </div>

                      <div>
                        <strong>{account.name}</strong>

                        <span>
                          {account.institution || account.account_type}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(account.balance, account.currency)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No accounts yet.</div>
              )}
            </article>

            <article className="panel dashboard-quick-panel">
              <span className="eyebrow">Quick actions</span>

              <h3>What do you want to do?</h3>

              <div className="dashboard-quick-actions">
                <Link to="/transactions/new">
                  <CreditCard size={18} />

                  <div>
                    <strong>Add transaction</strong>

                    <span>Record money in or out</span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link to="/bills">
                  <ReceiptText size={18} />

                  <div>
                    <strong>Add a bill</strong>

                    <span>Track something upcoming</span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link to="/goals">
                  <Target size={18} />

                  <div>
                    <strong>Savings goal</strong>

                    <span>Plan for something bigger</span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link to="/analytics">
                  <TrendingUp size={18} />

                  <div>
                    <strong>View analytics</strong>

                    <span>Understand your spending</span>
                  </div>

                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
