import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  apiFetch,
} from "../services/api";

import {
  formatCurrency,
  formatDate,
} from "../utils/currency";


export default function Transactions() {
  const [items, setItems] =
    useState(null);

  const [accounts, setAccounts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("");

  const [accountId, setAccountId] =
    useState("");

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);


  async function loadTransactions() {
    try {
      setError("");

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (type) {
        params.set(
          "type",
          type
        );
      }

      if (accountId) {
        params.set(
          "account_id",
          accountId
        );
      }

      const query =
        params.toString();

      const data =
        await apiFetch(
          `/transactions${
            query
              ? `?${query}`
              : ""
          }`
        );

      setItems(
        data.transactions || []
      );
    } catch (err) {
      setError(err.message);
      setItems([]);
    }
  }


  useEffect(() => {
    Promise.all([
      apiFetch("/accounts"),
      apiFetch("/transactions"),
    ])
      .then(
        ([
          accountData,
          transactionData,
        ]) => {
          setAccounts(
            accountData.accounts || []
          );

          setItems(
            transactionData.transactions ||
              []
          );
        }
      )
      .catch((err) => {
        setError(err.message);
        setItems([]);
      });
  }, []);


  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "Delete this transaction? The account balance will be adjusted automatically."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await apiFetch(
        `/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }


  function getAccountName(id) {
    return (
      accounts.find(
        (account) =>
          Number(account.id) ===
          Number(id)
      )?.name || "Account"
    );
  }


  function getTransactionIcon(kind) {
    if (kind === "income") {
      return (
        <ArrowDownLeft
          size={18}
        />
      );
    }

    if (kind === "transfer") {
      return (
        <ArrowLeftRight
          size={18}
        />
      );
    }

    return (
      <ArrowUpRight
        size={18}
      />
    );
  }


  function resetFilters() {
    setSearch("");
    setType("");
    setAccountId("");

    apiFetch("/transactions")
      .then((data) => {
        setItems(
          data.transactions || []
        );
      })
      .catch((err) => {
        setError(err.message);
      });
  }


  if (!items) {
    return (
      <div className="loading-state">
        Loading transactions...
      </div>
    );
  }


  return (
    <div className="page-content">

      <section className="page-heading">
        <div>
          <span className="eyebrow">
            Money movement
          </span>

          <h1>
            Transactions
          </h1>

          <p>
            Every shilling,
            clearly tracked.
          </p>
        </div>

        <Link
          className="primary-button"
          to="/transactions/new"
        >
          <Plus size={18} />
          Add transaction
        </Link>
      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      <section className="panel">

        <form
          className="toolbar transaction-toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            loadTransactions();
          }}
        >

          <div className="toolbar-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search merchant, description or notes..."
            />
          </div>


          <select
            className="filter-select"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value
              )
            }
          >
            <option value="">
              All types
            </option>

            <option value="income">
              Income
            </option>

            <option value="expense">
              Expenses
            </option>

            <option value="transfer">
              Transfers
            </option>
          </select>


          <select
            className="filter-select"
            value={accountId}
            onChange={(event) =>
              setAccountId(
                event.target.value
              )
            }
          >
            <option value="">
              All accounts
            </option>

            {accounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              )
            )}
          </select>


          <button
            className="secondary-button"
            type="submit"
          >
            Search
          </button>


          {(search ||
            type ||
            accountId) && (
            <button
              className="ghost-button"
              type="button"
              onClick={resetFilters}
            >
              Clear
            </button>
          )}
        </form>


        {items.length ? (
          <div className="transaction-list">

            {items.map((transaction) => {

              const isIncome =
                transaction.transaction_type ===
                "income";

              const isTransfer =
                transaction.transaction_type ===
                "transfer";

              return (
                <div
                  className="transaction-row"
                  key={transaction.id}
                >

                  <div className="transaction-left">

                    <div
                      className={`transaction-icon transaction-icon-${transaction.transaction_type}`}
                    >
                      {getTransactionIcon(
                        transaction.transaction_type
                      )}
                    </div>


                    <div>
                      <strong>
                        {transaction.merchant ||
                          transaction.description ||
                          (isTransfer
                            ? "Account transfer"
                            : transaction.transaction_type)}
                      </strong>

                      <span>
                        {isTransfer
                          ? `${getAccountName(
                              transaction.account_id
                            )} → ${getAccountName(
                              transaction.destination_account_id
                            )}`
                          : `${
                              transaction
                                .category
                                ?.name ||
                              transaction.transaction_type
                            } · ${getAccountName(
                              transaction.account_id
                            )}`}
                      </span>

                      <span>
                        {formatDate(
                          transaction.transaction_date
                        )}
                      </span>
                    </div>
                  </div>


                  <div className="transaction-right">

                    <strong
                      className={
                        isIncome
                          ? "income"
                          : isTransfer
                            ? "transfer-amount"
                            : "expense"
                      }
                    >
                      {isIncome
                        ? "+"
                        : isTransfer
                          ? ""
                          : "-"}

                      {formatCurrency(
                        transaction.amount
                      )}
                    </strong>


                    <div className="transaction-actions">

                      <Link
                        className="transaction-action-button"
                        to={`/transactions/${transaction.id}/edit`}
                        title="Edit transaction"
                      >
                        <Pencil
                          size={15}
                        />
                      </Link>


                      <button
                        className="transaction-action-button danger"
                        type="button"
                        disabled={
                          deletingId ===
                          transaction.id
                        }
                        onClick={() =>
                          handleDelete(
                            transaction.id
                          )
                        }
                        title="Delete transaction"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          <div className="empty-state">

            <strong>
              No transactions found
            </strong>

            <span>
              Add your first transaction
              or change your filters.
            </span>

          </div>
        )}

      </section>

    </div>
  );
}