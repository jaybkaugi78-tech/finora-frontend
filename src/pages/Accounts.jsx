import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  Banknote,
  Building2,
  Check,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Smartphone,
  Star,
  WalletCards,
  X,
} from "lucide-react";

import {
  apiFetch,
} from "../services/api";

import {
  formatCurrency,
} from "../utils/currency";


const EMPTY_FORM = {
  name: "",
  account_type: "mobile_money",
  institution: "",
  balance: "",
  currency: "KES",
  is_default: false,
};


export default function Accounts() {
  const [accounts, setAccounts] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showArchived, setShowArchived] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [busyId, setBusyId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState(EMPTY_FORM);


  async function load() {
    const data =
      await apiFetch(
        "/accounts?include_archived=true"
      );

    setAccounts(
      data.accounts || []
    );
  }


  useEffect(() => {
    load().catch((err) => {
      setError(err.message);
      setAccounts([]);
    });
  }, []);


  const activeAccounts =
    useMemo(
      () =>
        (accounts || []).filter(
          (account) =>
            !account.is_archived
        ),
      [accounts]
    );


  const archivedAccounts =
    useMemo(
      () =>
        (accounts || []).filter(
          (account) =>
            account.is_archived
        ),
      [accounts]
    );


  const total =
    activeAccounts.reduce(
      (sum, account) =>
        sum +
        Number(
          account.balance || 0
        ),
      0
    );


  function resetForm() {
    setEditingId(null);

    setForm(
      EMPTY_FORM
    );

    setShowForm(false);
    setError("");
  }


  function openCreate() {
    setEditingId(null);

    setForm(
      EMPTY_FORM
    );

    setShowForm(true);
    setError("");
  }


  function openEdit(account) {
    setEditingId(
      account.id
    );

    setForm({
      name:
        account.name || "",

      account_type:
        account.account_type ||
        "mobile_money",

      institution:
        account.institution ||
        "",

      balance: "",

      currency:
        account.currency ||
        "KES",

      is_default:
        Boolean(
          account.is_default
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

      if (!form.name.trim()) {
        throw new Error(
          "Enter an account name."
        );
      }

      if (editingId) {
        await apiFetch(
          `/accounts/${editingId}`,
          {
            method: "PATCH",

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                account_type:
                  form.account_type,

                institution:
                  form.institution.trim(),

                currency:
                  form.currency,

                is_default:
                  form.is_default,
              }),
          }
        );
      } else {
        await apiFetch(
          "/accounts",
          {
            method: "POST",

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                account_type:
                  form.account_type,

                institution:
                  form.institution.trim(),

                balance:
                  Number(
                    form.balance ||
                      0
                  ),

                currency:
                  form.currency,

                is_default:
                  form.is_default,
              }),
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


  async function setDefault(
    account
  ) {
    try {
      setBusyId(
        account.id
      );

      setError("");

      await apiFetch(
        `/accounts/${account.id}`,
        {
          method: "PATCH",

          body:
            JSON.stringify({
              is_default: true,
            }),
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }


  async function archiveAccount(
    account
  ) {
    const confirmed =
      window.confirm(
        `Archive "${account.name}"? Its transaction history will stay safe.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(
        account.id
      );

      setError("");

      await apiFetch(
        `/accounts/${account.id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }


  async function restoreAccount(
    account
  ) {
    try {
      setBusyId(
        account.id
      );

      setError("");

      await apiFetch(
        `/accounts/${account.id}`,
        {
          method: "PATCH",

          body:
            JSON.stringify({
              is_archived:
                false,
            }),
        }
      );

      await load();

    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }


  function getIcon(type) {
    switch (type) {
      case "mobile_money":
        return (
          <Smartphone
            size={21}
          />
        );

      case "bank":
        return (
          <Building2
            size={21}
          />
        );

      case "cash":
        return (
          <Banknote
            size={21}
          />
        );

      case "savings":
        return (
          <PiggyBank
            size={21}
          />
        );

      default:
        return (
          <WalletCards
            size={21}
          />
        );
    }
  }


  if (!accounts) {
    return (
      <div className="loading-state">
        Loading accounts...
      </div>
    );
  }


  return (
    <div className="page-content">

      <section className="page-heading">
        <div>
          <span className="eyebrow">
            Where your money lives
          </span>

          <h1>
            Accounts
          </h1>

          <p>
            M-Pesa, bank, cash
            and savings in one
            place.
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
              Add account
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
                  ? "Update account"
                  : "New account"}
              </span>

              <h3>
                {editingId
                  ? "Edit account"
                  : "Add an account"}
              </h3>
            </div>
          </div>


          <div className="form-grid">

            <label>
              Account name

              <input
                value={
                  form.name
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    name:
                      event
                        .target
                        .value,
                  })
                }
                placeholder="e.g. M-Pesa"
                required
              />
            </label>


            <label>
              Account type

              <select
                value={
                  form.account_type
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    account_type:
                      event
                        .target
                        .value,
                  })
                }
              >
                <option value="mobile_money">
                  Mobile money
                </option>

                <option value="bank">
                  Bank
                </option>

                <option value="cash">
                  Cash
                </option>

                <option value="savings">
                  Savings
                </option>
              </select>
            </label>


            <label>
              Institution

              <input
                value={
                  form.institution
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    institution:
                      event
                        .target
                        .value,
                  })
                }
                placeholder={
                  form.account_type ===
                  "mobile_money"
                    ? "e.g. Safaricom"
                    : form.account_type ===
                        "bank"
                      ? "e.g. KCB"
                      : "Optional"
                }
              />
            </label>


            <label>
              Currency

              <select
                value={
                  form.currency
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    currency:
                      event
                        .target
                        .value,
                  })
                }
              >
                <option value="KES">
                  KES
                </option>

                <option value="USD">
                  USD
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="GBP">
                  GBP
                </option>
              </select>
            </label>


            {!editingId && (
              <label>
                Opening balance

                <input
                  type="number"
                  step="0.01"
                  value={
                    form.balance
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,

                      balance:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="0.00"
                />
              </label>
            )}


            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={
                  form.is_default
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    is_default:
                      event
                        .target
                        .checked,
                  })
                }
              />

              Make this my
              default account
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
                : "Create account"}
          </button>

        </form>
      )}


      <section className="hero-balance compact">
        <div>
          <span>
            Total across active
            accounts
          </span>

          <h2>
            {formatCurrency(
              total
            )}
          </h2>

          <p>
            {activeAccounts.length}{" "}
            active{" "}
            {activeAccounts.length ===
            1
              ? "account"
              : "accounts"}
          </p>
        </div>
      </section>


      <section className="accounts-section">

        <div className="section-title-row">
          <div>
            <span className="eyebrow">
              Active
            </span>

            <h2>
              Your accounts
            </h2>
          </div>
        </div>


        {activeAccounts.length ? (
          <div className="cards-grid">

            {activeAccounts.map(
              (account) => (
                <article
                  className="panel account-card"
                  key={
                    account.id
                  }
                >

                  <div className="account-card-top">

                    <div className="account-icon">
                      {getIcon(
                        account.account_type
                      )}
                    </div>


                    {account.is_default && (
                      <span className="default-badge">
                        <Star
                          size={13}
                        />
                        Default
                      </span>
                    )}

                  </div>


                  <div>
                    <span className="eyebrow">
                      {account.account_type.replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                    <h3>
                      {account.name}
                    </h3>

                    {account.institution && (
                      <p className="account-institution">
                        {
                          account.institution
                        }
                      </p>
                    )}
                  </div>


                  <strong className="account-balance">
                    {formatCurrency(
                      account.balance,
                      account.currency
                    )}
                  </strong>


                  <div className="account-actions">

                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={() =>
                        openEdit(
                          account
                        )
                      }
                    >
                      <Pencil
                        size={15}
                      />
                      Edit
                    </button>


                    {!account.is_default && (
                      <button
                        type="button"
                        className="ghost-button small-button"
                        disabled={
                          busyId ===
                          account.id
                        }
                        onClick={() =>
                          setDefault(
                            account
                          )
                        }
                      >
                        <Check
                          size={15}
                        />
                        Make default
                      </button>
                    )}


                    <button
                      type="button"
                      className="ghost-button small-button danger-action"
                      disabled={
                        busyId ===
                        account.id
                      }
                      onClick={() =>
                        archiveAccount(
                          account
                        )
                      }
                    >
                      <Archive
                        size={15}
                      />
                      Archive
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        ) : (
          <div className="panel empty-state">
            <strong>
              No active accounts
            </strong>

            <span>
              Create an account
              to start tracking
              your money.
            </span>
          </div>
        )}

      </section>


      {archivedAccounts.length >
        0 && (
        <section className="archived-section">

          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setShowArchived(
                !showArchived
              )
            }
          >
            <Archive
              size={16}
            />

            {showArchived
              ? "Hide"
              : "Show"}{" "}
            archived accounts (
            {
              archivedAccounts.length
            }
            )
          </button>


          {showArchived && (
            <div className="cards-grid archived-grid">

              {archivedAccounts.map(
                (account) => (
                  <article
                    className="panel account-card archived-account"
                    key={
                      account.id
                    }
                  >

                    <div className="account-icon">
                      {getIcon(
                        account.account_type
                      )}
                    </div>


                    <div>
                      <span className="eyebrow">
                        Archived
                      </span>

                      <h3>
                        {account.name}
                      </h3>

                      <p>
                        {account.account_type.replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    </div>


                    <strong>
                      {formatCurrency(
                        account.balance,
                        account.currency
                      )}
                    </strong>


                    <button
                      type="button"
                      className="secondary-button small-button"
                      disabled={
                        busyId ===
                        account.id
                      }
                      onClick={() =>
                        restoreAccount(
                          account
                        )
                      }
                    >
                      <RotateCcw
                        size={15}
                      />
                      Restore
                    </button>

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