import {
  useEffect,
  useState,
} from "react";

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

import {
  apiFetch,
} from "../services/api";

import {
  formatCurrency,
} from "../utils/currency";


function monthName(
  year,
  month,
  long = false
) {
  return new Date(
    year,
    month - 1,
    1
  ).toLocaleString(
    "en-KE",
    {
      month:
        long
          ? "long"
          : "short",

      year:
        long
          ? "numeric"
          : undefined,
    }
  );
}


function ChangeIndicator({
  value,
  inverse = false,
}) {
  if (
    value === null ||
    value === undefined
  ) {
    return (
      <span className="analytics-change neutral">
        No previous data
      </span>
    );
  }

  if (value === 0) {
    return (
      <span className="analytics-change neutral">
        No change
      </span>
    );
  }

  const positive =
    value > 0;

  const good =
    inverse
      ? !positive
      : positive;

  return (
    <span
      className={`analytics-change ${
        good
          ? "positive"
          : "negative"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={14} />
      ) : (
        <ArrowDownRight size={14} />
      )}

      {Math.abs(value)}%
      {" "}
      vs last month
    </span>
  );
}


export default function Analytics() {
  const [trend, setTrend] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

  const [accounts, setAccounts] =
    useState([]);

  const [accountTotal, setAccountTotal] =
    useState(0);

  const [insights, setInsights] =
    useState(null);

  const [error, setError] =
    useState("");


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
        apiFetch(
          "/analytics/monthly-trend?months=6"
        ),

        apiFetch(
          "/analytics/spending-by-category"
        ),

        apiFetch(
          "/analytics/summary"
        ),

        apiFetch(
          "/analytics/accounts"
        ),

        apiFetch(
          "/analytics/insights"
        ),
      ]);

      setTrend(
        trendData.trend || []
      );

      setCategories(
        categoryData.categories ||
          []
      );

      setSummary(
        summaryData
      );

      setAccounts(
        accountData.accounts ||
          []
      );

      setAccountTotal(
        Number(
          accountData.total_balance ||
            0
        )
      );

      setInsights(
        insightData
      );

    } catch (err) {
      setError(
        err.message
      );

      setTrend([]);
    }
  }


  useEffect(() => {
    load();
  }, []);


  if (!trend && !error) {
    return (
      <div className="loading-state">
        Loading analytics...
      </div>
    );
  }


  const chartMax = Math.max(
    1,

    ...(trend || []).flatMap(
      (item) => [
        Number(
          item.income || 0
        ),

        Number(
          item.expenses || 0
        ),
      ]
    )
  );


  const topCategory =
    categories[0] || null;


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Understand your habits
          </span>

          <h1>
            Analytics
          </h1>

          <p>
            See the patterns behind
            your money.
          </p>
        </div>

      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {!error && summary && (
        <>

          <section className="analytics-summary-grid">

            <article className="panel analytics-stat-card">

              <div className="analytics-stat-icon">
                <TrendingUp
                  size={19}
                />
              </div>

              <span className="eyebrow">
                Income
              </span>

              <strong>
                {formatCurrency(
                  summary.income
                )}
              </strong>

              <ChangeIndicator
                value={
                  summary.income_change
                }
              />

            </article>


            <article className="panel analytics-stat-card">

              <div className="analytics-stat-icon">
                <TrendingDown
                  size={19}
                />
              </div>

              <span className="eyebrow">
                Expenses
              </span>

              <strong>
                {formatCurrency(
                  summary.expenses
                )}
              </strong>

              <ChangeIndicator
                value={
                  summary.expense_change
                }
                inverse
              />

            </article>


            <article className="panel analytics-stat-card">

              <div className="analytics-stat-icon">
                <CircleDollarSign
                  size={19}
                />
              </div>

              <span className="eyebrow">
                Net cash flow
              </span>

              <strong>
                {formatCurrency(
                  summary.net_cash_flow
                )}
              </strong>

              <span
                className={`analytics-change ${
                  summary.net_cash_flow >=
                  0
                    ? "positive"
                    : "negative"
                }`}
              >
                {summary.net_cash_flow >=
                0
                  ? "Positive cash flow"
                  : "Negative cash flow"}
              </span>

            </article>


            <article className="panel analytics-stat-card">

              <div className="analytics-stat-icon">
                <BarChart3
                  size={19}
                />
              </div>

              <span className="eyebrow">
                Savings rate
              </span>

              <strong>
                {summary.savings_rate}%
              </strong>

              <span className="analytics-change neutral">
                Income minus expenses
              </span>

            </article>

          </section>


          <section className="analytics-main-grid">

            <article className="panel analytics-trend-panel">

              <div className="panel-heading">

                <div>
                  <span className="eyebrow">
                    6-month view
                  </span>

                  <h3>
                    Income vs expenses
                  </h3>
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

                  {trend.map(
                    (item) => {
                      const incomeHeight =
                        Number(
                          item.income ||
                            0
                        ) /
                        chartMax *
                        100;

                      const expenseHeight =
                        Number(
                          item.expenses ||
                            0
                        ) /
                        chartMax *
                        100;

                      return (
                        <div
                          className="analytics-month-column"
                          key={`${item.year}-${item.month}`}
                        >

                          <div className="analytics-bars">

                            <div
                              className="analytics-bar income-bar"
                              style={{
                                height:
                                  `${incomeHeight}%`,
                              }}
                              title={
                                formatCurrency(
                                  item.income
                                )
                              }
                            />

                            <div
                              className="analytics-bar expense-bar"
                              style={{
                                height:
                                  `${expenseHeight}%`,
                              }}
                              title={
                                formatCurrency(
                                  item.expenses
                                )
                              }
                            />

                          </div>


                          <strong>
                            {monthName(
                              item.year,
                              item.month
                            )}
                          </strong>

                        </div>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="empty-state">
                  No transaction history
                  yet.
                </div>
              )}

            </article>


            <article className="panel analytics-insights-panel">

              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    This month
                  </span>

                  <h3>
                    Quick insights
                  </h3>
                </div>
              </div>


              <div className="analytics-insight-list">

                <div className="analytics-insight">

                  <ReceiptText
                    size={18}
                  />

                  <div>
                    <span>
                      Transactions
                    </span>

                    <strong>
                      {insights
                        ?.transaction_count ||
                        0}
                    </strong>
                  </div>

                </div>


                <div className="analytics-insight">

                  <CircleDollarSign
                    size={18}
                  />

                  <div>
                    <span>
                      Average expense
                    </span>

                    <strong>
                      {formatCurrency(
                        insights
                          ?.average_expense ||
                          0
                      )}
                    </strong>
                  </div>

                </div>


                <div className="analytics-insight">

                  <WalletCards
                    size={18}
                  />

                  <div>
                    <span>
                      Total balance
                    </span>

                    <strong>
                      {formatCurrency(
                        accountTotal
                      )}
                    </strong>
                  </div>

                </div>


                <div className="analytics-insight">

                  <BarChart3
                    size={18}
                  />

                  <div>
                    <span>
                      Top category
                    </span>

                    <strong>
                      {topCategory
                        ? topCategory.name
                        : "No data"}
                    </strong>
                  </div>

                </div>

              </div>

            </article>

          </section>


          <section className="analytics-lower-grid">

            <article className="panel analytics-category-panel">

              <div className="panel-heading">

                <div>
                  <span className="eyebrow">
                    Categories
                  </span>

                  <h3>
                    Spending breakdown
                  </h3>
                </div>

              </div>


              {categories.length ? (
                <div className="analytics-category-list">

                  {categories.map(
                    (category) => (
                      <div
                        className="analytics-category-row"
                        key={
                          category.category_id
                        }
                      >

                        <div className="analytics-category-info">

                          <div className="analytics-category-title">

                            <strong>
                              {category.name}
                            </strong>

                            <span>
                              {category.percentage}%
                            </span>

                          </div>


                          <div className="analytics-progress">

                            <span
                              style={{
                                width:
                                  `${Math.min(
                                    category.percentage,
                                    100
                                  )}%`,
                              }}
                            />

                          </div>

                        </div>


                        <strong>
                          {formatCurrency(
                            category.spent
                          )}
                        </strong>

                      </div>
                    )
                  )}

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
                  <span className="eyebrow">
                    Accounts
                  </span>

                  <h3>
                    Balance distribution
                  </h3>
                </div>

              </div>


              <div className="analytics-total-balance">

                <span>
                  Total available
                </span>

                <strong>
                  {formatCurrency(
                    accountTotal
                  )}
                </strong>

              </div>


              {accounts.length ? (
                <div className="analytics-account-list">

                  {accounts.map(
                    (account) => (
                      <div
                        className="analytics-account-row"
                        key={account.id}
                      >

                        <div className="analytics-account-icon">
                          <Landmark
                            size={17}
                          />
                        </div>


                        <div className="analytics-account-info">

                          <div>
                            <strong>
                              {account.name}
                            </strong>

                            <span>
                              {account.percentage}%
                            </span>
                          </div>


                          <small>
                            {account.institution ||
                              account.account_type}
                          </small>

                        </div>


                        <strong>
                          {formatCurrency(
                            account.balance,
                            account.currency
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="empty-state">
                  No accounts yet.
                </div>
              )}

            </article>

          </section>


          {insights?.largest_expense && (
            <section className="panel analytics-highlight">

              <div className="analytics-highlight-icon">
                <ReceiptText
                  size={20}
                />
              </div>


              <div>
                <span className="eyebrow">
                  Largest expense this month
                </span>

                <h3>
                  {insights
                    .largest_expense
                    .merchant ||
                    insights
                      .largest_expense
                      .description ||
                    "Expense"}
                </h3>
              </div>


              <strong>
                {formatCurrency(
                  insights
                    .largest_expense
                    .amount
                )}
              </strong>

            </section>
          )}

        </>
      )}

    </div>
  );
}