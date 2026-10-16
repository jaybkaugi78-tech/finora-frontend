
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/currency";

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value, currency = "KES") {
  const number = numberOrNull(value);

  return number === null
    ? "—"
    : formatCurrency(number, currency);
}

function percent(value) {
  const number = numberOrNull(value);
  return number === null ? "—" : `${number.toFixed(1)}%`;
}

function getList(data, ...keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) {
      return data.data[key];
    }
  }

  return [];
}

function monthName(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ""));

  if (!match) return "Unknown";

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) return "Unknown";

  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function ChangeIndicator({ value, inverse = false }) {
  const change = numberOrNull(value);

  if (change === null) {
    return (
      <span className="analytics-change neutral">
        No previous data
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="analytics-change neutral">
        No change
      </span>
    );
  }

  const positive = change > 0;
  const good = inverse ? !positive : positive;

  return (
    <span
      className={`analytics-change ${
        good ? "positive" : "negative"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={14} />
      ) : (
        <ArrowDownRight size={14} />
      )}

      {Math.abs(change).toFixed(1)}% vs last month
    </span>
  );
}

function Insight({ icon: Icon, label, children }) {
  return (
    <div className="analytics-insight">
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong>{children}</strong>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");

        const [
          trendData,
          categoryData,
          summaryData,
          accountData,
          insightData,
        ] = await Promise.all([
          apiFetch("/analytics/monthly-trend?months=6"),
          apiFetch("/analytics/spending-by-category"),
          apiFetch("/analytics/summary"),
          apiFetch("/analytics/accounts"),
          apiFetch("/analytics/insights"),
        ]);

        if (cancelled) return;

        setData({
          trendData,
          categoryData,
          summaryData,
          accountData,
          insightData,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load analytics.");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="loading-state">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <section className="page-heading">
          <h1>Analytics</h1>
        </section>
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  const {
    trendData,
    categoryData,
    summaryData,
    accountData,
    insightData,
  } = data;

  const trend = getList(
    trendData,
    "monthly_trend",
    "trend"
  );

  const rawCategories = getList(
    categoryData,
    "categories",
    "spending_by_category",
    "breakdown"
  );

  const accounts = getList(
    accountData,
    "accounts"
  );

  const summary =
    summaryData?.summary ||
    summaryData?.data?.summary ||
    summaryData?.data ||
    summaryData ||
    {};

  const insights =
  insightData?.data?.transaction_count !== undefined
    ? insightData.data
    : insightData || {};

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const currentTrend = trend.find(
    (item) => item.month === currentMonth
  );

  const income = numberOrNull(
    summary.income ??
    summary.total_income ??
    currentTrend?.income
  );

  const expenses = numberOrNull(
    summary.expenses ??
    summary.total_expenses ??
    currentTrend?.expenses
  );

  const netCashFlow = numberOrNull(
    summary.net_cash_flow ??
    summary.net ??
    (
      income !== null && expenses !== null
        ? income - expenses
        : null
    )
  );

  const savingsRate = numberOrNull(
    summary.savings_rate ??
    (
      income !== null &&
      income > 0 &&
      netCashFlow !== null
        ? (netCashFlow / income) * 100
        : null
    )
  );

  const accountCurrencies = [
    ...new Set(
      accounts.map((account) => account.currency || "KES")
    ),
  ];

  const sameCurrency = accountCurrencies.length <= 1;

  const accountTotal = sameCurrency
    ? (
        numberOrNull(
          accountData?.total_balance ??
          accountData?.total ??
          accountData?.data?.total_balance
        ) ??
        (
          accounts.length
            ? accounts.reduce(
                (sum, account) =>
                  sum + (numberOrNull(account.balance) ?? 0),
                0
              )
            : null
        )
      )
    : null;

  const accountCurrency = accountCurrencies[0] || "KES";

  const categoryAmounts = rawCategories.map((category) => ({
    ...category,
    amount: numberOrNull(
      category.spent ??
      category.amount ??
      category.total
    ),
  }));

  const totalCategorySpending = categoryAmounts.reduce(
    (sum, category) => sum + (category.amount ?? 0),
    0
  );

  const categories = categoryAmounts
    .map((category) => ({
      ...category,
      percentage: numberOrNull(category.percentage) ??
        (
          category.amount !== null &&
          totalCategorySpending > 0
            ? (category.amount / totalCategorySpending) * 100
            : null
        ),
    }))
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

  const topCategory = categories.find(
    (category) => category.amount !== null && category.amount > 0
  );

  const chartMax = Math.max(
    1,
    ...trend.flatMap((item) => [
      numberOrNull(item.income) ?? 0,
      numberOrNull(item.expenses) ?? 0,
    ])
  );

  const transactionCount = numberOrNull(
    insights.transaction_count ??
    insights.total_transactions ??
    insights.transactions_count
  );

  const averageExpense = numberOrNull(
    insights.average_expense ??
    insights.avg_expense
  );

  const largestExpense =
    insights.largest_expense || null;

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            Understand your habits
          </span>
          <h1>Analytics</h1>
          <p>See the patterns behind your money.</p>
        </div>
      </section>

      <section className="analytics-summary-grid">
        <article className="panel analytics-stat-card">
          <div className="analytics-stat-icon">
            <TrendingUp size={19} />
          </div>
          <span className="eyebrow">Income</span>
          <strong>{money(income)}</strong>
          <ChangeIndicator
            value={
              summary.income_change ??
              summary.income_change_percentage
            }
          />
        </article>

        <article className="panel analytics-stat-card">
          <div className="analytics-stat-icon">
            <TrendingDown size={19} />
          </div>
          <span className="eyebrow">Expenses</span>
          <strong>{money(expenses)}</strong>
          <ChangeIndicator
            value={
              summary.expense_change ??
              summary.expense_change_percentage
            }
            inverse
          />
        </article>

        <article className="panel analytics-stat-card">
          <div className="analytics-stat-icon">
            <CircleDollarSign size={19} />
          </div>
          <span className="eyebrow">Net cash flow</span>
          <strong>{money(netCashFlow)}</strong>
          <span
            className={`analytics-change ${
              netCashFlow === null
                ? "neutral"
                : netCashFlow >= 0
                  ? "positive"
                  : "negative"
            }`}
          >
            {netCashFlow === null
              ? "No data"
              : netCashFlow >= 0
                ? "Positive cash flow"
                : "Negative cash flow"}
          </span>
        </article>

        <article className="panel analytics-stat-card">
          <div className="analytics-stat-icon">
            <BarChart3 size={19} />
          </div>
          <span className="eyebrow">Savings rate</span>
          <strong>{percent(savingsRate)}</strong>
          <span className="analytics-change neutral">
            {income === 0
              ? "No income recorded"
              : "Income minus expenses"}
          </span>
        </article>
      </section>

      <section className="analytics-main-grid">
        <article className="panel analytics-trend-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">6-month view</span>
              <h3>Income vs expenses</h3>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot income-dot" />
                Income
              </span>
              <span>
                <i className="legend-dot expense-dot" />
                Expenses
              </span>
            </div>
          </div>

          {trend.length ? (
            <div className="analytics-bar-chart">
              {trend.map((item, index) => {
                const incomeValue =
                  numberOrNull(item.income) ?? 0;

                const expenseValue =
                  numberOrNull(item.expenses) ?? 0;

                return (
                  <div
                    className="analytics-month-column"
                    key={`${item.month}-${index}`}
                  >
                    <div className="analytics-bars">
                      <div
                        className="analytics-bar income-bar"
                        style={{
                          height: `${incomeValue / chartMax * 100}%`,
                        }}
                        title={money(incomeValue)}
                      />
                      <div
                        className="analytics-bar expense-bar"
                        style={{
                          height: `${expenseValue / chartMax * 100}%`,
                        }}
                        title={money(expenseValue)}
                      />
                    </div>

                    <strong>{monthName(item.month)}</strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No transaction history yet.
            </div>
          )}
        </article>

        <article className="panel analytics-insights-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">This month</span>
              <h3>Quick insights</h3>
            </div>
          </div>

          <div className="analytics-insight-list">
            <Insight icon={ReceiptText} label="Transactions">
              {transactionCount ?? "—"}
            </Insight>

            <Insight
              icon={CircleDollarSign}
              label="Average expense"
            >
              {money(averageExpense)}
            </Insight>

            <Insight icon={WalletCards} label="Total balance">
              {sameCurrency
                ? money(accountTotal, accountCurrency)
                : "Multiple currencies"}
            </Insight>

            <Insight icon={BarChart3} label="Top category">
              {topCategory?.name ??
                topCategory?.category_name ??
                "No spending data"}
            </Insight>
          </div>
        </article>
      </section>

      <section className="analytics-lower-grid">
        <article className="panel analytics-category-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Categories</span>
              <h3>Spending breakdown</h3>
            </div>
          </div>

          {categories.length ? (
            <div className="analytics-category-list">
              {categories.map((category, index) => {
                const percentage = category.percentage;

                return (
                  <div
                    className="analytics-category-row"
                    key={category.category_id ?? category.id ?? index}
                  >
                    <div className="analytics-category-info">
                      <div className="analytics-category-title">
                        <strong>
                          {category.name ??
                            category.category_name ??
                            "Uncategorized"}
                        </strong>
                        <span>{percent(percentage)}</span>
                      </div>

                      <div className="analytics-progress">
                        <span
                          style={{
                            width: `${
                              percentage === null
                                ? 0
                                : Math.max(
                                    0,
                                    Math.min(percentage, 100)
                                  )
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <strong>{money(category.amount)}</strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No spending data yet.
            </div>
          )}
        </article>

        <article className="panel analytics-account-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Accounts</span>
              <h3>Balance distribution</h3>
            </div>
          </div>

          <div className="analytics-total-balance">
            <span>Total available</span>
            <strong>
              {sameCurrency
                ? money(accountTotal, accountCurrency)
                : "Multiple currencies"}
            </strong>
          </div>

          {accounts.length ? (
            <div className="analytics-account-list">
              {accounts.map((account, index) => {
                const balance =
                  numberOrNull(account.balance) ?? 0;

                const share =
                  sameCurrency &&
                  accountTotal !== null &&
                  accountTotal > 0
                    ? balance / accountTotal * 100
                    : null;

                return (
                  <div
                    className="analytics-account-row"
                    key={account.id ?? index}
                  >
                    <div className="analytics-account-icon">
                      <Landmark size={17} />
                    </div>

                    <div className="analytics-account-info">
                      <div>
                        <strong>{account.name}</strong>
                        <span>{percent(share)}</span>
                      </div>

                      <small>
                        {account.institution ||
                          account.account_type ||
                          "Account"}
                      </small>
                    </div>

                    <strong>
                      {money(
                        account.balance,
                        account.currency || "KES"
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No accounts yet.
            </div>
          )}
        </article>
      </section>

      {largestExpense && (
        <section className="panel analytics-highlight">
          <div className="analytics-highlight-icon">
            <ReceiptText size={20} />
          </div>

          <div>
            <span className="eyebrow">
              Largest expense this month
            </span>
            <h3>
              {largestExpense.merchant ||
                largestExpense.description ||
                "Expense"}
            </h3>
          </div>

          <strong>{money(largestExpense.amount)}</strong>
        </section>
      )}
    </div>
  );
}
