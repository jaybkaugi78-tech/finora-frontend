import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  apiFetch,
} from "../services/api";


function localDateTimeValue(value) {
  if (!value) {
    const now = new Date();

    const offset =
      now.getTimezoneOffset();

    const local =
      new Date(
        now.getTime() -
          offset * 60 * 1000
      );

    return local
      .toISOString()
      .slice(0, 16);
  }

  const date =
    new Date(value);

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    );

  return local
    .toISOString()
    .slice(0, 16);
}


export default function AddTransaction() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const editing =
    Boolean(id);


  const [accounts, setAccounts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  const [form, setForm] =
    useState({
      transaction_type:
        "expense",

      amount: "",

      account_id: "",

      destination_account_id:
        "",

      category_id: "",

      merchant: "",

      description: "",

      notes: "",

      transaction_date:
        localDateTimeValue(),

      is_recurring: false,
    });


  useEffect(() => {
    async function loadPage() {
      try {
        setError("");

        const requests = [
          apiFetch("/accounts"),
          apiFetch("/categories"),
        ];

        if (editing) {
          requests.push(
            apiFetch(
              `/transactions/${id}`
            )
          );
        }

        const results =
          await Promise.all(
            requests
          );

        const accountData =
          results[0];

        const categoryData =
          results[1];

        const activeAccounts =
          (
            accountData.accounts ||
            []
          ).filter(
            (account) =>
              !account.is_archived
          );

        setAccounts(
          activeAccounts
        );

        setCategories(
          categoryData.categories ||
            []
        );


        if (editing) {
          const transaction =
            results[2].transaction;

          setForm({
            transaction_type:
              transaction.transaction_type,

            amount:
              String(
                transaction.amount
              ),

            account_id:
              String(
                transaction.account_id
              ),

            destination_account_id:
              transaction.destination_account_id
                ? String(
                    transaction.destination_account_id
                  )
                : "",

            category_id:
              transaction.category_id
                ? String(
                    transaction.category_id
                  )
                : "",

            merchant:
              transaction.merchant ||
              "",

            description:
              transaction.description ||
              "",

            notes:
              transaction.notes ||
              "",

            transaction_date:
              localDateTimeValue(
                transaction.transaction_date
              ),

            is_recurring:
              Boolean(
                transaction.is_recurring
              ),
          });
        } else {
          setForm(
            (current) => ({
              ...current,

              account_id:
                activeAccounts[0]
                  ? String(
                      activeAccounts[0]
                        .id
                    )
                  : "",
            })
          );
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [editing, id]);


  const filteredCategories =
    useMemo(() => {
      return categories.filter(
        (category) =>
          category.category_type ===
          form.transaction_type
      );
    }, [
      categories,
      form.transaction_type,
    ]);


  useEffect(() => {
    if (
      form.transaction_type ===
      "transfer"
    ) {
      return;
    }

    const currentIsValid =
      filteredCategories.some(
        (category) =>
          String(category.id) ===
          String(
            form.category_id
          )
      );

    if (
      !currentIsValid &&
      filteredCategories[0]
    ) {
      setForm(
        (current) => ({
          ...current,

          category_id:
            String(
              filteredCategories[0]
                .id
            ),
        })
      );
    }
  }, [
    filteredCategories,
    form.transaction_type,
    form.category_id,
  ]);


  function changeType(type) {
    setForm(
      (current) => ({
        ...current,

        transaction_type:
          type,

        category_id:
          "",

        destination_account_id:
          "",
      })
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.account_id) {
        throw new Error(
          "Please select an account."
        );
      }

      if (
        Number(form.amount) <= 0
      ) {
        throw new Error(
          "Enter an amount greater than zero."
        );
      }

      if (
        form.transaction_type ===
          "transfer" &&
        !form.destination_account_id
      ) {
        throw new Error(
          "Please select a destination account."
        );
      }

      if (
        form.transaction_type !==
          "transfer" &&
        !form.category_id
      ) {
        throw new Error(
          "Please select a category."
        );
      }


      const payload = {
        transaction_type:
          form.transaction_type,

        amount:
          Number(form.amount),

        account_id:
          Number(
            form.account_id
          ),

        destination_account_id:
          form.transaction_type ===
          "transfer"
            ? Number(
                form.destination_account_id
              )
            : null,

        category_id:
          form.transaction_type ===
          "transfer"
            ? null
            : Number(
                form.category_id
              ),

        merchant:
          form.merchant.trim(),

        description:
          form.description.trim(),

        notes:
          form.notes.trim(),

        transaction_date:
          new Date(
            form.transaction_date
          ).toISOString(),

        is_recurring:
          form.is_recurring,
      };


      if (editing) {
        await apiFetch(
          `/transactions/${id}`,
          {
            method: "PATCH",
            body:
              JSON.stringify(
                payload
              ),
          }
        );
      } else {
        await apiFetch(
          "/transactions",
          {
            method: "POST",
            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }


      navigate(
        "/transactions"
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="loading-state">
        Loading transaction...
      </div>
    );
  }


  return (
    <div className="page-content narrow-page">

      <section className="page-heading">
        <div>

          <Link
            className="back-link"
            to="/transactions"
          >
            <ArrowLeft size={16} />
            Transactions
          </Link>

          <span className="eyebrow">
            {editing
              ? "Update money movement"
              : "Record money movement"}
          </span>

          <h1>
            {editing
              ? "Edit transaction"
              : "Add transaction"}
          </h1>

          <p>
            {editing
              ? "Update the transaction and Finora will correct the account balances automatically."
              : "Record income, expenses or transfers between your accounts."}
          </p>

        </div>
      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      <form
        className="panel form-card"
        onSubmit={
          handleSubmit
        }
      >

        <div className="type-tabs">

          <button
            type="button"
            className={
              form.transaction_type ===
              "expense"
                ? "active"
                : ""
            }
            onClick={() =>
              changeType(
                "expense"
              )
            }
          >
            <ArrowUpRight
              size={16}
            />
            Expense
          </button>


          <button
            type="button"
            className={
              form.transaction_type ===
              "income"
                ? "active"
                : ""
            }
            onClick={() =>
              changeType(
                "income"
              )
            }
          >
            <ArrowDownLeft
              size={16}
            />
            Income
          </button>


          <button
            type="button"
            className={
              form.transaction_type ===
              "transfer"
                ? "active"
                : ""
            }
            onClick={() =>
              changeType(
                "transfer"
              )
            }
          >
            <ArrowLeftRight
              size={16}
            />
            Transfer
          </button>

        </div>


        <div className="form-grid">

          <label className="form-span-2">
            Amount

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={
                form.amount
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  amount:
                    event.target
                      .value,
                })
              }
              required
            />
          </label>


          <label>
            {form.transaction_type ===
            "transfer"
              ? "From account"
              : "Account"}

            <select
              value={
                form.account_id
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  account_id:
                    event.target
                      .value,
                })
              }
              required
            >
              <option value="">
                Select account
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {account.name}
                  </option>
                )
              )}
            </select>
          </label>


          {form.transaction_type ===
          "transfer" ? (
            <label>
              To account

              <select
                value={
                  form.destination_account_id
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    destination_account_id:
                      event
                        .target
                        .value,
                  })
                }
                required
              >
                <option value="">
                  Select destination
                </option>

                {accounts
                  .filter(
                    (account) =>
                      String(
                        account.id
                      ) !==
                      String(
                        form.account_id
                      )
                  )
                  .map(
                    (account) => (
                      <option
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                      >
                        {
                          account.name
                        }
                      </option>
                    )
                  )}
              </select>
            </label>
          ) : (
            <label>
              Category

              <select
                value={
                  form.category_id
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    category_id:
                      event
                        .target
                        .value,
                  })
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {filteredCategories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </label>
          )}


          <label>
            Merchant / source

            <input
              value={
                form.merchant
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  merchant:
                    event.target
                      .value,
                })
              }
              placeholder={
                form.transaction_type ===
                "income"
                  ? "e.g. Salary"
                  : "e.g. Carrefour"
              }
            />
          </label>


          <label>
            Date

            <input
              type="datetime-local"
              value={
                form.transaction_date
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  transaction_date:
                    event.target
                      .value,
                })
              }
              required
            />
          </label>


          <label className="form-span-2">
            Description

            <input
              value={
                form.description
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  description:
                    event.target
                      .value,
                })
              }
              placeholder="What was this transaction for?"
            />
          </label>


          <label className="form-span-2">
            Notes

            <textarea
              rows="4"
              value={
                form.notes
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  notes:
                    event.target
                      .value,
                })
              }
              placeholder="Optional notes..."
            />
          </label>


          <label className="checkbox-label form-span-2">
            <input
              type="checkbox"
              checked={
                form.is_recurring
              }
              onChange={(event) =>
                setForm({
                  ...form,

                  is_recurring:
                    event.target
                      .checked,
                })
              }
            />

            Recurring transaction
          </label>

        </div>


        <button
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editing
              ? "Save changes"
              : "Save transaction"}
        </button>

      </form>

    </div>
  );
}