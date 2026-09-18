import {
  useEffect,
  useState,
} from "react";

import {
  BellRing,
  CalendarDays,
  Check,
  Clock3,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  apiFetch,
} from "../services/api";

import {
  formatCurrency,
  formatDate,
} from "../utils/currency";


const EMPTY_FORM = {
  name: "",
  amount: "",
  next_due_date: "",
  frequency: "monthly",
  reminder_days: 3,
  is_subscription: false,
  category_id: "",
  account_id: "",
};


function frequencyLabel(value) {
  const labels = {
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };

  return labels[value] || value;
}


function dueLabel(bill) {
  if (!bill.is_active) {
    return "Inactive";
  }

  if (bill.is_overdue) {
    const days = Math.abs(
      bill.days_until_due
    );

    return `${days} day${
      days === 1 ? "" : "s"
    } overdue`;
  }

  if (bill.is_due_today) {
    return "Due today";
  }

  if (bill.days_until_due === 1) {
    return "Due tomorrow";
  }

  return `Due in ${bill.days_until_due} days`;
}


export default function Bills() {
  const [items, setItems] =
    useState(null);

  const [summary, setSummary] =
    useState({
      active_count: 0,
      upcoming_total: 0,
      overdue_total: 0,
      due_soon_count: 0,
      subscriptions_total: 0,
    });

  const [categories, setCategories] =
    useState([]);

  const [accounts, setAccounts] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showInactive, setShowInactive] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [workingId, setWorkingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState(EMPTY_FORM);


  async function load() {
    try {
      setError("");

      const [
        billData,
        categoryData,
        accountData,
      ] = await Promise.all([
        apiFetch("/bills"),

        apiFetch(
          "/categories?type=expense"
        ),

        apiFetch(
          "/accounts?include_archived=false"
        ),
      ]);

      setItems(
        billData.bills || []
      );

      setSummary(
        billData.summary || {
          active_count: 0,
          upcoming_total: 0,
          overdue_total: 0,
          due_soon_count: 0,
          subscriptions_total: 0,
        }
      );

      setCategories(
        categoryData.categories ||
          []
      );

      setAccounts(
        (accountData.accounts || [])
          .filter(
            (account) =>
              !account.is_archived
          )
      );

    } catch (err) {
      setError(err.message);
      setItems([]);
    }
  }


  useEffect(() => {
    load();
  }, []);


  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }


  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }


  function openEdit(bill) {
    setEditingId(bill.id);

    setForm({
      name:
        bill.name || "",

      amount:
        String(
          bill.amount
        ),

      next_due_date:
        bill.next_due_date || "",

      frequency:
        bill.frequency ||
        "monthly",

      reminder_days:
        bill.reminder_days ??
        3,

      is_subscription:
        Boolean(
          bill.is_subscription
        ),

      category_id:
        bill.category_id
          ? String(
              bill.category_id
            )
          : "",

      account_id:
        bill.account_id
          ? String(
              bill.account_id
            )
          : "",
    });

    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function submit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const amount =
        Number(
          form.amount
        );

      if (amount <= 0) {
        throw new Error(
          "Amount must be greater than zero."
        );
      }

      const payload = {
        name:
          form.name.trim(),

        amount,

        next_due_date:
          form.next_due_date,

        frequency:
          form.frequency,

        reminder_days:
          Number(
            form.reminder_days
          ),

        is_subscription:
          form.is_subscription,

        category_id:
          form.category_id
            ? Number(
                form.category_id
              )
            : null,

        account_id:
          form.account_id
            ? Number(
                form.account_id
              )
            : null,
      };


      if (editingId) {
        await apiFetch(
          `/bills/${editingId}`,
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
          "/bills",
          {
            method: "POST",
            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      closeForm();
      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  async function markPaid(bill) {
    const confirmed =
      window.confirm(
        `Mark "${bill.name}" as paid? Its next due date will be advanced automatically.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(bill.id);
      setError("");

      await apiFetch(
        `/bills/${bill.id}/mark-paid`,
        {
          method: "POST",
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }


  async function toggleActive(bill) {
    try {
      setWorkingId(bill.id);
      setError("");

      await apiFetch(
        `/bills/${bill.id}`,
        {
          method: "PATCH",

          body:
            JSON.stringify({
              is_active:
                !bill.is_active,
            }),
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }


  async function deleteBill(bill) {
    const confirmed =
      window.confirm(
        `Delete "${bill.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(bill.id);
      setError("");

      await apiFetch(
        `/bills/${bill.id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }


  if (!items) {
    return (
      <div className="loading-state">
        Loading bills...
      </div>
    );
  }


  const activeBills =
    items.filter(
      (bill) => bill.is_active
    );

  const inactiveBills =
    items.filter(
      (bill) => !bill.is_active
    );


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Upcoming commitments
          </span>

          <h1>
            Bills & subscriptions
          </h1>

          <p>
            Know what is due before
            it surprises you.
          </p>
        </div>


        <button
          className="primary-button"
          type="button"
          onClick={
            showForm
              ? closeForm
              : openCreate
          }
        >
          {showForm ? (
            <>
              <X size={18} />
              Close
            </>
          ) : (
            <>
              <Plus size={18} />
              Add bill
            </>
          )}
        </button>

      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {showForm && (
        <form
          className="panel form-card"
          onSubmit={submit}
        >

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                {editingId
                  ? "Update commitment"
                  : "New commitment"}
              </span>

              <h3>
                {editingId
                  ? "Edit bill"
                  : "Add bill or subscription"}
              </h3>
            </div>
          </div>


          <div className="form-grid">

            <label>
              Name

              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
                }
                placeholder="e.g. Netflix"
                required
              />
            </label>


            <label>
              Amount

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    amount:
                      event.target.value,
                  })
                }
                placeholder="e.g. 1100"
                required
              />
            </label>


            <label>
              Next due date

              <input
                type="date"
                value={
                  form.next_due_date
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    next_due_date:
                      event.target.value,
                  })
                }
                required
              />
            </label>


            <label>
              Frequency

              <select
                value={
                  form.frequency
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    frequency:
                      event.target.value,
                  })
                }
              >
                <option value="weekly">
                  Weekly
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="quarterly">
                  Quarterly
                </option>

                <option value="yearly">
                  Yearly
                </option>
              </select>
            </label>


            <label>
              Category

              <select
                value={
                  form.category_id
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    category_id:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  No category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              Pay from account

              <select
                value={
                  form.account_id
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    account_id:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  No account
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


            <label>
              Remind me before

              <select
                value={
                  form.reminder_days
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    reminder_days:
                      event.target.value,
                  })
                }
              >
                <option value="0">
                  On due date
                </option>

                <option value="1">
                  1 day before
                </option>

                <option value="3">
                  3 days before
                </option>

                <option value="7">
                  1 week before
                </option>

                <option value="14">
                  2 weeks before
                </option>
              </select>
            </label>


            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={
                  form.is_subscription
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    is_subscription:
                      event.target.checked,
                  })
                }
              />

              Subscription
            </label>

          </div>


          <button
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Save bill"}
          </button>

        </form>
      )}


      <section className="bill-summary-grid">

        <article className="panel bill-summary-card">
          <span className="eyebrow">
            Upcoming bills
          </span>

          <strong>
            {formatCurrency(
              summary.upcoming_total
            )}
          </strong>

          <small>
            {summary.active_count} active
          </small>
        </article>


        <article className="panel bill-summary-card">
          <span className="eyebrow">
            Due soon
          </span>

          <strong>
            {summary.due_soon_count}
          </strong>

          <small>
            Within reminder period
          </small>
        </article>


        <article className="panel bill-summary-card">
          <span className="eyebrow">
            Overdue
          </span>

          <strong
            className={
              summary.overdue_total > 0
                ? "bill-danger"
                : ""
            }
          >
            {formatCurrency(
              summary.overdue_total
            )}
          </strong>

          <small>
            Past due date
          </small>
        </article>

      </section>


      {activeBills.length ? (
        <section className="cards-grid">

          {activeBills.map(
            (bill) => (
              <article
                className={`panel bill-card ${
                  bill.is_overdue
                    ? "bill-card-overdue"
                    : ""
                }`}
                key={bill.id}
              >

                <div className="bill-card-header">

                  <div className="bill-icon">
                    {bill.is_subscription ? (
                      <RefreshCw
                        size={20}
                      />
                    ) : (
                      <BellRing
                        size={20}
                      />
                    )}
                  </div>


                  <span
                    className={`bill-status ${
                      bill.is_overdue
                        ? "overdue"
                        : bill.is_due_today
                          ? "today"
                          : bill.is_due_soon
                            ? "soon"
                            : ""
                    }`}
                  >
                    {dueLabel(bill)}
                  </span>

                </div>


                <div className="bill-content">

                  <span className="eyebrow">
                    {bill.is_subscription
                      ? "Subscription"
                      : frequencyLabel(
                          bill.frequency
                        )}
                  </span>

                  <h3>
                    {bill.name}
                  </h3>

                  <strong className="bill-amount">
                    {formatCurrency(
                      bill.amount
                    )}
                  </strong>

                </div>


                <div className="bill-details">

                  <div>
                    <CalendarDays
                      size={15}
                    />

                    <span>
                      Due{" "}
                      {formatDate(
                        bill.next_due_date
                      )}
                    </span>
                  </div>


                  {bill.category && (
                    <div>
                      <ReceiptText
                        size={15}
                      />

                      <span>
                        {
                          bill.category
                            .name
                        }
                      </span>
                    </div>
                  )}


                  {bill.account && (
                    <div>
                      <span>
                        Pay from{" "}
                        <strong>
                          {
                            bill.account
                              .name
                          }
                        </strong>
                      </span>
                    </div>
                  )}


                  <div>
                    <Clock3
                      size={15}
                    />

                    <span>
                      Reminder{" "}
                      {bill.reminder_days ===
                      0
                        ? "on due date"
                        : `${bill.reminder_days} day${
                            bill.reminder_days ===
                            1
                              ? ""
                              : "s"
                          } before`}
                    </span>
                  </div>

                </div>


                <div className="bill-actions">

                  <button
                    type="button"
                    className="primary-button small-button"
                    disabled={
                      workingId ===
                      bill.id
                    }
                    onClick={() =>
                      markPaid(bill)
                    }
                  >
                    <Check size={15} />
                    Mark paid
                  </button>


                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={() =>
                      openEdit(bill)
                    }
                  >
                    <Pencil size={15} />
                    Edit
                  </button>


                  <button
                    type="button"
                    className="secondary-button small-button"
                    disabled={
                      workingId ===
                      bill.id
                    }
                    onClick={() =>
                      toggleActive(bill)
                    }
                  >
                    Pause
                  </button>


                  <button
                    type="button"
                    className="ghost-button small-button danger-action"
                    disabled={
                      workingId ===
                      bill.id
                    }
                    onClick={() =>
                      deleteBill(bill)
                    }
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

              </article>
            )
          )}

        </section>
      ) : (
        <section className="panel empty-state bill-empty">
          <BellRing size={28} />

          <strong>
            No upcoming bills
          </strong>

          <span>
            Add your regular bills
            and subscriptions here.
          </span>
        </section>
      )}


      {inactiveBills.length > 0 && (
        <section className="inactive-bills-section">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setShowInactive(
                (current) =>
                  !current
              )
            }
          >
            {showInactive
              ? "Hide paused bills"
              : `Show paused bills (${inactiveBills.length})`}
          </button>


          {showInactive && (
            <div className="cards-grid inactive-bills-grid">

              {inactiveBills.map(
                (bill) => (
                  <article
                    className="panel bill-card inactive-bill"
                    key={bill.id}
                  >

                    <div className="bill-card-header">
                      <div className="bill-icon">
                        <BellRing
                          size={20}
                        />
                      </div>

                      <span className="bill-status">
                        Paused
                      </span>
                    </div>


                    <div className="bill-content">
                      <span className="eyebrow">
                        {frequencyLabel(
                          bill.frequency
                        )}
                      </span>

                      <h3>
                        {bill.name}
                      </h3>

                      <strong className="bill-amount">
                        {formatCurrency(
                          bill.amount
                        )}
                      </strong>
                    </div>


                    <div className="bill-actions">

                      <button
                        type="button"
                        className="primary-button small-button"
                        onClick={() =>
                          toggleActive(
                            bill
                          )
                        }
                      >
                        Resume
                      </button>


                      <button
                        type="button"
                        className="ghost-button small-button danger-action"
                        onClick={() =>
                          deleteBill(
                            bill
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                        Delete
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>
      )}

    </div>
  );
}