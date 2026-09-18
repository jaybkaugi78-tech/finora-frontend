import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import {
  apiFetch,
} from "../services/api";

import {
  formatCurrency,
} from "../utils/currency";

import ProgressBar
  from "../components/ProgressBar";


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


export default function Budgets() {
  const now = new Date();

  const [month, setMonth] =
    useState(
      now.getMonth() + 1
    );

  const [year, setYear] =
    useState(
      now.getFullYear()
    );

  const [items, setItems] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [summary, setSummary] =
    useState({
      total_budget: 0,
      total_spent: 0,
      total_remaining: 0,
      total_over: 0,
      percentage: 0,
    });

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      category_id: "",
      amount: "",
    });


  async function load(
    targetMonth = month,
    targetYear = year
  ) {
    try {
      setError("");

      const [
        budgetData,
        categoryData,
      ] = await Promise.all([
        apiFetch(
          `/budgets?month=${targetMonth}&year=${targetYear}`
        ),

        apiFetch(
          "/categories?type=expense"
        ),
      ]);

      setItems(
        budgetData.budgets || []
      );

      setSummary(
        budgetData.summary || {
          total_budget: 0,
          total_spent: 0,
          total_remaining: 0,
          total_over: 0,
          percentage: 0,
        }
      );

      const expenseCategories =
        categoryData.categories ||
        [];

      setCategories(
        expenseCategories
      );

      setForm(
        (current) => ({
          ...current,

          category_id:
            current.category_id ||
            (
              expenseCategories[0]
                ? String(
                    expenseCategories[0]
                      .id
                  )
                : ""
            ),
        })
      );

    } catch (err) {
      setError(err.message);
      setItems([]);
    }
  }


  useEffect(() => {
    load();
  }, [month, year]);


  function closeForm() {
    setShowForm(false);
    setEditingId(null);

    setForm({
      category_id:
        categories[0]
          ? String(
              categories[0].id
            )
          : "",

      amount: "",
    });

    setError("");
  }


  function openCreate() {
    setEditingId(null);

    setForm({
      category_id:
        categories[0]
          ? String(
              categories[0].id
            )
          : "",

      amount: "",
    });

    setShowForm(true);
    setError("");
  }


  function openEdit(budget) {
    setEditingId(
      budget.id
    );

    setForm({
      category_id:
        String(
          budget.category_id
        ),

      amount:
        String(
          budget.amount
        ),
    });

    setShowForm(true);
    setError("");
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
          "Enter a budget greater than zero."
        );
      }


      if (editingId) {
        await apiFetch(
          `/budgets/${editingId}`,
          {
            method: "PATCH",

            body:
              JSON.stringify({
                amount,
              }),
          }
        );
      } else {
        if (!form.category_id) {
          throw new Error(
            "Select an expense category."
          );
        }

        await apiFetch(
          "/budgets",
          {
            method: "POST",

            body:
              JSON.stringify({
                category_id:
                  Number(
                    form.category_id
                  ),

                amount,

                month,

                year,
              }),
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


  async function deleteBudget(
    budget
  ) {
    const confirmed =
      window.confirm(
        `Delete the ${budget.category?.name || ""} budget for ${MONTHS[month - 1]} ${year}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        budget.id
      );

      setError("");

      await apiFetch(
        `/budgets/${budget.id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }


  function previousMonth() {
    if (month === 1) {
      setMonth(12);

      setYear(
        (current) =>
          current - 1
      );
    } else {
      setMonth(
        (current) =>
          current - 1
      );
    }

    closeForm();
  }


  function nextMonth() {
    if (month === 12) {
      setMonth(1);

      setYear(
        (current) =>
          current + 1
      );
    } else {
      setMonth(
        (current) =>
          current + 1
      );
    }

    closeForm();
  }


  if (!items) {
    return (
      <div className="loading-state">
        Loading budgets...
      </div>
    );
  }


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Plan your spending
          </span>

          <h1>
            Budgets
          </h1>

          <p>
            Set monthly limits
            and see where your
            money is going.
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
              New budget
            </>
          )}
        </button>

      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      <section className="budget-period">

        <button
          type="button"
          className="budget-period-button"
          onClick={
            previousMonth
          }
        >
          <ChevronLeft
            size={18}
          />
        </button>


        <div>
          <span className="eyebrow">
            Budget period
          </span>

          <h3>
            {MONTHS[
              month - 1
            ]}{" "}
            {year}
          </h3>
        </div>


        <button
          type="button"
          className="budget-period-button"
          onClick={
            nextMonth
          }
        >
          <ChevronRight
            size={18}
          />
        </button>

      </section>


      {showForm && (
        <form
          className="panel form-card"
          onSubmit={submit}
        >

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                {editingId
                  ? "Update limit"
                  : `${MONTHS[month - 1]} ${year}`}
              </span>

              <h3>
                {editingId
                  ? "Edit budget"
                  : "Create budget"}
              </h3>
            </div>
          </div>


          <div className="form-grid">

            <label>
              Category

              <select
                value={
                  form.category_id
                }
                disabled={
                  Boolean(
                    editingId
                  )
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
              >
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
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              Monthly limit

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    amount:
                      event
                        .target
                        .value,
                  })
                }
                placeholder="e.g. 10000"
                required
              />
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
                : "Create budget"}
          </button>

        </form>
      )}


      <section className="budget-summary-grid">

        <article className="panel budget-summary-card">
          <span className="eyebrow">
            Monthly budget
          </span>

          <strong>
            {formatCurrency(
              summary.total_budget
            )}
          </strong>
        </article>


        <article className="panel budget-summary-card">
          <span className="eyebrow">
            Spent
          </span>

          <strong>
            {formatCurrency(
              summary.total_spent
            )}
          </strong>
        </article>


        <article className="panel budget-summary-card">
          <span className="eyebrow">
            {summary.total_over >
            0
              ? "Over budget"
              : "Remaining"}
          </span>

          <strong
            className={
              summary.total_over >
              0
                ? "budget-danger"
                : ""
            }
          >
            {formatCurrency(
              summary.total_over >
                0
                ? summary.total_over
                : summary.total_remaining
            )}
          </strong>
        </article>

      </section>


      {items.length ? (
        <section className="cards-grid">

          {items.map(
            (budget) => {

              const displayPercentage =
                Math.min(
                  Number(
                    budget.percentage ||
                      0
                  ),
                  100
                );

              return (
                <article
                  className={`panel budget-card ${
                    budget.is_over_budget
                      ? "budget-card-over"
                      : ""
                  }`}
                  key={
                    budget.id
                  }
                >

                  <div className="row-between">

                    <div>
                      <span className="eyebrow">
                        Category
                      </span>

                      <h3>
                        {budget.category
                          ?.name ||
                          "Budget"}
                      </h3>
                    </div>


                    <strong
                      className={
                        budget.is_over_budget
                          ? "budget-danger"
                          : ""
                      }
                    >
                      {Math.round(
                        budget.percentage
                      )}
                      %
                    </strong>

                  </div>


                  <ProgressBar
                    value={
                      displayPercentage
                    }
                  />


                  <div className="budget-money-row">

                    <div>
                      <span>
                        Spent
                      </span>

                      <strong>
                        {formatCurrency(
                          budget.spent
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Limit
                      </span>

                      <strong>
                        {formatCurrency(
                          budget.amount
                        )}
                      </strong>
                    </div>

                  </div>


                  <div
                    className={`budget-status ${
                      budget.is_over_budget
                        ? "over"
                        : ""
                    }`}
                  >
                    {budget.is_over_budget
                      ? `${formatCurrency(
                          budget.over_by
                        )} over budget`
                      : `${formatCurrency(
                          budget.remaining
                        )} remaining`}
                  </div>


                  <div className="budget-actions">

                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={() =>
                        openEdit(
                          budget
                        )
                      }
                    >
                      <Pencil
                        size={15}
                      />
                      Edit
                    </button>


                    <button
                      type="button"
                      className="ghost-button small-button danger-action"
                      disabled={
                        deletingId ===
                        budget.id
                      }
                      onClick={() =>
                        deleteBudget(
                          budget
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
              );
            }
          )}

        </section>
      ) : (
        <section className="panel empty-state budget-empty">

          <WalletCards
            size={28}
          />

          <strong>
            No budgets for{" "}
            {MONTHS[
              month - 1
            ]}
          </strong>

          <span>
            Create a budget to
            start planning your
            spending.
          </span>

        </section>
      )}

    </div>
  );
}