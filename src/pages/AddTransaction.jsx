
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/api";

// Supports direct arrays and common backend response wrappers.
function extractList(data, key) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.[key])) {
    return data.data[key];
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function extractTransaction(data) {
  return data?.transaction || data?.data?.transaction || data?.data || data;
}

function localDateTimeValue(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
}

function categoryType(category) {
  return String(
    category.category_type ||
      category.type ||
      category.transaction_type ||
      ""
  ).toLowerCase();
}

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [accountWarning, setAccountWarning] = useState("");
  const [categoryWarning, setCategoryWarning] = useState("");

  const [form, setForm] = useState({
    transaction_type: "expense",
    amount: "",
    account_id: "",
    destination_account_id: "",
    category_id: "",
    merchant: "",
    description: "",
    notes: "",
    transaction_date: localDateTimeValue(),
    is_recurring: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError("");
      setAccountWarning("");
      setCategoryWarning("");

      const [accountResult, categoryResult, transactionResult] =
        await Promise.allSettled([
          apiFetch("/accounts"),
          apiFetch("/categories"),
          editing
            ? apiFetch(`/transactions/${id}`)
            : Promise.resolve(null),
        ]);

      if (cancelled) return;

      let activeAccounts = [];

      if (accountResult.status === "fulfilled") {
        activeAccounts = extractList(
          accountResult.value,
          "accounts"
        ).filter(
          (account) =>
            account.is_archived !== true &&
            account.is_archived !== 1
        );

        setAccounts(activeAccounts);

        if (activeAccounts.length === 0) {
          setAccountWarning(
            "No active accounts were returned. Create an account or check the /accounts API response."
          );
        }
      } else {
        setAccounts([]);
        setAccountWarning(
          `Could not load accounts: ${accountResult.reason?.message || "Request failed."}`
        );
      }

      if (categoryResult.status === "fulfilled") {
        const loadedCategories = extractList(
          categoryResult.value,
          "categories"
        );

        setCategories(loadedCategories);

        if (loadedCategories.length === 0) {
          setCategoryWarning(
            "No categories were returned. Check the /categories API response."
          );
        }
      } else {
        setCategories([]);
        setCategoryWarning(
          `Could not load categories: ${categoryResult.reason?.message || "Request failed."}`
        );
      }

      if (editing) {
        if (transactionResult.status === "rejected") {
          setError(
            transactionResult.reason?.message ||
              "Could not load transaction."
          );
        } else {
          const transaction = extractTransaction(
            transactionResult.value
          );

          if (!transaction?.id) {
            setError("The transaction response is missing an ID.");
          } else {
            setForm({
              transaction_type:
                transaction.transaction_type || "expense",
              amount: String(transaction.amount ?? ""),
              account_id: String(transaction.account_id ?? ""),
              destination_account_id:
                transaction.destination_account_id != null
                  ? String(transaction.destination_account_id)
                  : "",
              category_id:
                transaction.category_id != null
                  ? String(transaction.category_id)
                  : "",
              merchant: transaction.merchant || "",
              description: transaction.description || "",
              notes: transaction.notes || "",
              transaction_date: localDateTimeValue(
                transaction.transaction_date
              ),
              is_recurring: Boolean(transaction.is_recurring),
            });
          }
        }
      } else {
        setForm((current) => ({
          ...current,
          account_id:
            current.account_id ||
            String(activeAccounts[0]?.id ?? ""),
        }));
      }

      setLoading(false);
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const type = categoryType(category);

      // Untyped categories can be used for either income or expense.
      return (
        !type ||
        type === "both" ||
        type === "all" ||
        type === form.transaction_type
      );
    });
  }, [categories, form.transaction_type]);

  useEffect(() => {
    if (form.transaction_type === "transfer") return;

    const valid = filteredCategories.some(
      (category) =>
        String(category.id) === String(form.category_id)
    );

    if (!valid) {
      setForm((current) => ({
        ...current,
        category_id: String(filteredCategories[0]?.id ?? ""),
      }));
    }
  }, [filteredCategories, form.transaction_type, form.category_id]);

  function changeType(type) {
    setForm((current) => ({
      ...current,
      transaction_type: type,
      category_id: "",
      destination_account_id: "",
    }));
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");

      const amount = Number(form.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter an amount greater than zero.");
      }

      if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) {
        throw new Error("Use a valid amount with at most two decimal places.");
      }

      if (!form.account_id) {
        throw new Error("Please select an account.");
      }

      if (form.transaction_type === "transfer") {
        if (!form.destination_account_id) {
          throw new Error("Please select a destination account.");
        }

        if (form.account_id === form.destination_account_id) {
          throw new Error(
            "Source and destination accounts must be different."
          );
        }
      } else if (!form.category_id) {
        throw new Error("Please select a category.");
      }

      const date = new Date(form.transaction_date);

      if (Number.isNaN(date.getTime())) {
        throw new Error("Please enter a valid transaction date.");
      }

      const payload = {
        transaction_type: form.transaction_type,
        amount: form.amount.trim(),
        account_id: Number(form.account_id),
        destination_account_id:
          form.transaction_type === "transfer"
            ? Number(form.destination_account_id)
            : null,
        category_id:
          form.transaction_type === "transfer"
            ? null
            : Number(form.category_id),
        merchant: form.merchant.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        transaction_date: date.toISOString(),
        is_recurring: form.is_recurring,
      };

      await apiFetch(
        editing ? `/transactions/${id}` : "/transactions",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      navigate("/transactions");
    } catch (err) {
      setError(err.message || "Could not save transaction.");
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
          <Link className="back-link" to="/transactions">
            <ArrowLeft size={16} />
            Transactions
          </Link>

          <span className="eyebrow">
            {editing
              ? "Update money movement"
              : "Record money movement"}
          </span>

          <h1>
            {editing ? "Edit transaction" : "Add transaction"}
          </h1>

          <p>
            {editing
              ? "Update the transaction and Finora will correct the account balances automatically."
              : "Record income, expenses or transfers between your accounts."}
          </p>
        </div>
      </section>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {accountWarning && (
        <div className="auth-error" role="alert">
          {accountWarning}
        </div>
      )}

      {categoryWarning && (
        <div className="auth-error" role="alert">
          {categoryWarning}
        </div>
      )}

      <form className="panel form-card" onSubmit={handleSubmit}>
        <div className="type-tabs">
          <button
            type="button"
            className={
              form.transaction_type === "expense" ? "active" : ""
            }
            onClick={() => changeType("expense")}
          >
            <ArrowUpRight size={16} />
            Expense
          </button>

          <button
            type="button"
            className={
              form.transaction_type === "income" ? "active" : ""
            }
            onClick={() => changeType("income")}
          >
            <ArrowDownLeft size={16} />
            Income
          </button>

          <button
            type="button"
            className={
              form.transaction_type === "transfer" ? "active" : ""
            }
            onClick={() => changeType("transfer")}
          >
            <ArrowLeftRight size={16} />
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
              value={form.amount}
              onChange={(event) =>
                updateField("amount", event.target.value)
              }
              required
            />
          </label>

          <label>
            {form.transaction_type === "transfer"
              ? "From account"
              : "Account"}

            <select
              value={form.account_id}
              onChange={(event) =>
                updateField("account_id", event.target.value)
              }
              required
            >
              <option value="">Select account</option>

              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          {form.transaction_type === "transfer" ? (
            <label>
              To account

              <select
                value={form.destination_account_id}
                onChange={(event) =>
                  updateField(
                    "destination_account_id",
                    event.target.value
                  )
                }
                required
              >
                <option value="">Select destination</option>

                {accounts
                  .filter(
                    (account) =>
                      String(account.id) !== form.account_id
                  )
                  .map((account) => (
                    <option
                      key={account.id}
                      value={String(account.id)}
                    >
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <label>
              Category

              <select
                value={form.category_id}
                onChange={(event) =>
                  updateField("category_id", event.target.value)
                }
                required
              >
                <option value="">Select category</option>

                {filteredCategories.map((category) => (
                  <option
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Merchant / source
            <input
              value={form.merchant}
              onChange={(event) =>
                updateField("merchant", event.target.value)
              }
              placeholder={
                form.transaction_type === "income"
                  ? "e.g. Salary"
                  : "e.g. Carrefour"
              }
            />
          </label>

          <label>
            Date
            <input
              type="datetime-local"
              value={form.transaction_date}
              onChange={(event) =>
                updateField("transaction_date", event.target.value)
              }
              required
            />
          </label>

          <label className="form-span-2">
            Description
            <input
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What was this transaction for?"
            />
          </label>

          <label className="form-span-2">
            Notes
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              placeholder="Optional notes..."
            />
          </label>

          <label className="checkbox-label form-span-2">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(event) =>
                updateField("is_recurring", event.target.checked)
              }
            />
            Recurring transaction
          </label>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={saving || accounts.length === 0}
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
