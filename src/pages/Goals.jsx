import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Target,
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

import ProgressBar
  from "../components/ProgressBar";


const EMPTY_FORM = {
  name: "",
  target_amount: "",
  target_date: "",
  notes: "",
};


export default function Goals() {
  const [items, setItems] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [activeGoal, setActiveGoal] =
    useState(null);

  const [historyId, setHistoryId] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [contribution, setContribution] =
    useState({
      amount: "",
      note: "",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  async function load() {
    try {
      setError("");

      const data =
        await apiFetch(
          "/goals"
        );

      setItems(
        data.goals || []
      );

    } catch (err) {
      setError(err.message);
      setItems([]);
    }
  }


  useEffect(() => {
    load();
  }, []);


  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }


  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }


  function openEdit(goal) {
    setEditingId(goal.id);

    setForm({
      name:
        goal.name || "",

      target_amount:
        String(
          goal.target_amount
        ),

      target_date:
        goal.target_date || "",

      notes:
        goal.notes || "",
    });

    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function saveGoal(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const targetAmount =
        Number(
          form.target_amount
        );

      if (targetAmount <= 0) {
        throw new Error(
          "Target amount must be greater than zero."
        );
      }

      const payload = {
        name:
          form.name.trim(),

        target_amount:
          targetAmount,

        target_date:
          form.target_date ||
          null,

        notes:
          form.notes.trim(),
      };


      if (editingId) {
        await apiFetch(
          `/goals/${editingId}`,
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
          "/goals",
          {
            method: "POST",

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      resetForm();
      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  function openContribution(goal) {
    setActiveGoal(goal);

    setContribution({
      amount: "",
      note: "",
    });

    setError("");
  }


  function closeContribution() {
    setActiveGoal(null);

    setContribution({
      amount: "",
      note: "",
    });
  }


  async function addContribution(
    event
  ) {
    event.preventDefault();

    if (!activeGoal) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const amount =
        Number(
          contribution.amount
        );

      if (amount <= 0) {
        throw new Error(
          "Contribution must be greater than zero."
        );
      }

      await apiFetch(
        `/goals/${activeGoal.id}/contributions`,
        {
          method: "POST",

          body:
            JSON.stringify({
              amount,

              note:
                contribution.note
                  .trim(),
            }),
        }
      );

      closeContribution();
      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  async function deleteGoal(goal) {
    const confirmed =
      window.confirm(
        `Delete "${goal.name}" and its contribution history?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/goals/${goal.id}`,
        {
          method: "DELETE",
        }
      );

      if (
        activeGoal?.id ===
        goal.id
      ) {
        closeContribution();
      }

      await load();

    } catch (err) {
      setError(err.message);
    }
  }


  async function deleteContribution(
    goal,
    item
  ) {
    const confirmed =
      window.confirm(
        `Remove this ${formatCurrency(item.amount)} contribution?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(
        `/goals/${goal.id}/contributions/${item.id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    }
  }


  if (!items) {
    return (
      <div className="loading-state">
        Loading goals...
      </div>
    );
  }


  const totalTarget =
    items.reduce(
      (sum, goal) =>
        sum +
        Number(
          goal.target_amount ||
          0
        ),
      0
    );


  const totalSaved =
    items.reduce(
      (sum, goal) =>
        sum +
        Number(
          goal.saved_amount ||
          0
        ),
      0
    );


  const completedGoals =
    items.filter(
      (goal) =>
        goal.is_completed
    ).length;


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Build your future
          </span>

          <h1>
            Savings goals
          </h1>

          <p>
            Turn your plans into
            measurable progress.
          </p>
        </div>


        <button
          className="primary-button"
          type="button"
          onClick={
            showForm
              ? resetForm
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
              New goal
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
          onSubmit={saveGoal}
        >

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                {editingId
                  ? "Update goal"
                  : "New savings goal"}
              </span>

              <h3>
                {editingId
                  ? "Edit goal"
                  : "What are you saving for?"}
              </h3>
            </div>
          </div>


          <div className="form-grid">

            <label>
              Goal name

              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,

                    name:
                      event.target
                        .value,
                  })
                }
                placeholder="e.g. New laptop"
                required
              />
            </label>


            <label>
              Target amount

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.target_amount
                }
                onChange={(event) =>
                  setForm({
                    ...form,

                    target_amount:
                      event.target
                        .value,
                  })
                }
                placeholder="e.g. 120000"
                required
              />
            </label>


            <label>
              Target date

              <input
                type="date"
                value={
                  form.target_date
                }
                onChange={(event) =>
                  setForm({
                    ...form,

                    target_date:
                      event.target
                        .value,
                  })
                }
              />
            </label>


            <label>
              Notes

              <input
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
                placeholder="Optional"
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
                : "Create goal"}
          </button>

        </form>
      )}


      {activeGoal && (
        <form
          className="panel form-card goal-contribution-form"
          onSubmit={
            addContribution
          }
        >

          <div className="panel-heading">

            <div>
              <span className="eyebrow">
                Add savings
              </span>

              <h3>
                {activeGoal.name}
              </h3>

              <p>
                {formatCurrency(
                  activeGoal.remaining
                )}{" "}
                remaining
              </p>
            </div>


            <button
              type="button"
              className="icon-button"
              onClick={
                closeContribution
              }
            >
              <X size={18} />
            </button>

          </div>


          <div className="form-grid">

            <label>
              Amount

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  contribution.amount
                }
                onChange={(event) =>
                  setContribution({
                    ...contribution,

                    amount:
                      event.target
                        .value,
                  })
                }
                placeholder="Amount saved"
                required
              />
            </label>


            <label>
              Note

              <input
                value={
                  contribution.note
                }
                onChange={(event) =>
                  setContribution({
                    ...contribution,

                    note:
                      event.target
                        .value,
                  })
                }
                placeholder="Optional note"
              />
            </label>

          </div>


          <button
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Adding..."
              : "Add contribution"}
          </button>

        </form>
      )}


      <section className="goal-summary-grid">

        <article className="panel goal-summary-card">
          <span className="eyebrow">
            Total target
          </span>

          <strong>
            {formatCurrency(
              totalTarget
            )}
          </strong>
        </article>


        <article className="panel goal-summary-card">
          <span className="eyebrow">
            Saved
          </span>

          <strong>
            {formatCurrency(
              totalSaved
            )}
          </strong>
        </article>


        <article className="panel goal-summary-card">
          <span className="eyebrow">
            Completed
          </span>

          <strong>
            {completedGoals}
            <small>
              {" "}
              / {items.length}
            </small>
          </strong>
        </article>

      </section>


      {items.length ? (
        <section className="cards-grid">

          {items.map((goal) => {

            const visibleProgress =
              Math.min(
                Number(
                  goal.percentage ||
                  0
                ),
                100
              );

            const historyOpen =
              historyId ===
              goal.id;

            return (
              <article
                className={`panel goal-card ${
                  goal.is_completed
                    ? "goal-completed"
                    : ""
                }`}
                key={goal.id}
              >

                <div className="goal-card-header">

                  <div className="goal-icon">
                    {goal.is_completed ? (
                      <CheckCircle2
                        size={22}
                      />
                    ) : (
                      <Target
                        size={22}
                      />
                    )}
                  </div>


                  {goal.is_completed && (
                    <span className="goal-complete-badge">
                      Completed
                    </span>
                  )}

                </div>


                <div>

                  <span className="eyebrow">
                    {goal.target_date
                      ? `Target ${formatDate(
                          goal.target_date
                        )}`
                      : "No target date"}
                  </span>

                  <h3>
                    {goal.name}
                  </h3>

                  {goal.notes && (
                    <p className="goal-notes">
                      {goal.notes}
                    </p>
                  )}

                </div>


                <div className="goal-money">

                  <strong className="goal-amount">
                    {formatCurrency(
                      goal.saved_amount
                    )}
                  </strong>

                  <span>
                    of{" "}
                    {formatCurrency(
                      goal.target_amount
                    )}
                  </span>

                </div>


                <ProgressBar
                  value={
                    visibleProgress
                  }
                />


                <div className="row-between muted">

                  <span>
                    {Math.round(
                      goal.percentage
                    )}
                    % complete
                  </span>

                  <span>
                    {goal.is_completed
                      ? "Target reached"
                      : `${formatCurrency(
                          goal.remaining
                        )} left`}
                  </span>

                </div>


                <div className="goal-actions">

                  {!goal.is_completed && (
                    <button
                      type="button"
                      className="primary-button small-button"
                      onClick={() =>
                        openContribution(
                          goal
                        )
                      }
                    >
                      <Plus
                        size={15}
                      />
                      Add money
                    </button>
                  )}


                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={() =>
                      openEdit(
                        goal
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
                    onClick={() =>
                      deleteGoal(
                        goal
                      )
                    }
                  >
                    <Trash2
                      size={15}
                    />
                    Delete
                  </button>

                </div>


                <button
                  type="button"
                  className="goal-history-toggle"
                  onClick={() =>
                    setHistoryId(
                      historyOpen
                        ? null
                        : goal.id
                    )
                  }
                >
                  <span>
                    {
                      goal.contribution_count ||
                      0
                    }{" "}
                    contribution
                    {goal.contribution_count ===
                    1
                      ? ""
                      : "s"}
                  </span>

                  {historyOpen ? (
                    <ChevronUp
                      size={16}
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                    />
                  )}
                </button>


                {historyOpen && (
                  <div className="goal-history">

                    {goal.contributions
                      ?.length ? (

                      goal.contributions.map(
                        (item) => (
                          <div
                            className="goal-history-item"
                            key={
                              item.id
                            }
                          >

                            <div>
                              <strong>
                                {formatCurrency(
                                  item.amount
                                )}
                              </strong>

                              <span>
                                <CalendarDays
                                  size={13}
                                />

                                {formatDate(
                                  item.contributed_at
                                )}
                              </span>

                              {item.note && (
                                <small>
                                  {
                                    item.note
                                  }
                                </small>
                              )}
                            </div>


                            <button
                              type="button"
                              className="icon-button danger-action"
                              onClick={() =>
                                deleteContribution(
                                  goal,
                                  item
                                )
                              }
                            >
                              <Trash2
                                size={15}
                              />
                            </button>

                          </div>
                        )
                      )

                    ) : (
                      <div className="goal-history-empty">
                        No contributions yet.
                      </div>
                    )}

                  </div>
                )}

              </article>
            );
          })}

        </section>
      ) : (
        <section className="panel empty-state goal-empty">

          <Target size={30} />

          <strong>
            No savings goals yet
          </strong>

          <span>
            Create your first goal
            and start tracking your
            progress.
          </span>

        </section>
      )}

    </div>
  );
}