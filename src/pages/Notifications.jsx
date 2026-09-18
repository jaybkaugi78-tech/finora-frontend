import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  CreditCard,
  Info,
  Mail,
  MailOpen,
  ReceiptText,
  Trash2,
} from "lucide-react";

import {
  apiFetch,
} from "../services/api";


function NotificationIcon({
  type,
}) {
  if (
    type === "bill_overdue"
  ) {
    return (
      <Clock3 size={19} />
    );
  }

  if (
    type === "bill_due" ||
    type === "bill_reminder"
  ) {
    return (
      <ReceiptText size={19} />
    );
  }

  if (
    type === "transaction"
  ) {
    return (
      <CreditCard size={19} />
    );
  }

  if (
    type === "general"
  ) {
    return (
      <Info size={19} />
    );
  }

  return (
    <Bell size={19} />
  );
}


function formatNotificationDate(
  value
) {
  if (!value) {
    return "";
  }

  const date = new Date(
    value
  );

  const now = new Date();

  const diff =
    now.getTime()
    - date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  const hours = Math.floor(
    diff / 3600000
  );

  const days = Math.floor(
    diff / 86400000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-KE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


export default function Notifications() {
  const [items, setItems] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [totalCount, setTotalCount] =
    useState(0);

  const [error, setError] =
    useState("");

  const [workingId, setWorkingId] =
    useState(null);

  const [workingAll, setWorkingAll] =
    useState(false);


  async function load(
    selectedFilter = filter
  ) {
    try {
      setError("");

      const data = await apiFetch(
        `/notifications?filter=${selectedFilter}`
      );

      setItems(
        data.notifications || []
      );

      setUnreadCount(
        data.unread_count || 0
      );

      setTotalCount(
        data.total_count || 0
      );

    } catch (err) {
      setError(
        err.message
      );

      setItems([]);
    }
  }


  useEffect(() => {
    load(filter);
  }, [filter]);


  async function markRead(
    notification
  ) {
    if (
      notification.is_read
    ) {
      return;
    }

    try {
      setWorkingId(
        notification.id
      );

      setError("");

      await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setWorkingId(null);
    }
  }


  async function markUnread(
    notification
  ) {
    try {
      setWorkingId(
        notification.id
      );

      setError("");

      await apiFetch(
        `/notifications/${notification.id}/unread`,
        {
          method: "PATCH",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setWorkingId(null);
    }
  }


  async function markAllRead() {
    if (!unreadCount) {
      return;
    }

    try {
      setWorkingAll(true);
      setError("");

      await apiFetch(
        "/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setWorkingAll(false);
    }
  }


  async function deleteNotification(
    notification
  ) {
    try {
      setWorkingId(
        notification.id
      );

      setError("");

      await apiFetch(
        `/notifications/${notification.id}`,
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setWorkingId(null);
    }
  }


  async function clearRead() {
    const confirmed =
      window.confirm(
        "Clear all read notifications?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingAll(true);
      setError("");

      await apiFetch(
        "/notifications/read",
        {
          method: "DELETE",
        }
      );

      await load();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setWorkingAll(false);
    }
  }


  if (!items) {
    return (
      <div className="loading-state">
        Loading notifications...
      </div>
    );
  }


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Finora alerts
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Your money reminders
            live here.
          </p>
        </div>


        {unreadCount > 0 && (
          <button
            type="button"
            className="primary-button"
            disabled={
              workingAll
            }
            onClick={
              markAllRead
            }
          >
            <CheckCheck
              size={17}
            />

            Mark all read
          </button>
        )}

      </section>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      <section className="notification-summary-grid">

        <article className="panel notification-summary-card">

          <div className="notification-summary-icon">
            <BellRing
              size={19}
            />
          </div>

          <div>
            <span>
              Unread
            </span>

            <strong>
              {unreadCount}
            </strong>
          </div>

        </article>


        <article className="panel notification-summary-card">

          <div className="notification-summary-icon">
            <Mail
              size={19}
            />
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {totalCount}
            </strong>
          </div>

        </article>

      </section>


      <section className="notification-toolbar">

        <div className="notification-filters">

          <button
            type="button"
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>


          <button
            type="button"
            className={
              filter === "unread"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "unread"
              )
            }
          >
            Unread

            {unreadCount > 0 && (
              <span>
                {unreadCount}
              </span>
            )}
          </button>


          <button
            type="button"
            className={
              filter === "read"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("read")
            }
          >
            Read
          </button>

        </div>


        {totalCount >
          unreadCount && (
          <button
            type="button"
            className="ghost-button notification-clear-button"
            disabled={
              workingAll
            }
            onClick={
              clearRead
            }
          >
            <Trash2
              size={15}
            />

            Clear read
          </button>
        )}

      </section>


      <section className="panel notification-panel">

        {items.length ? (
          <div className="notification-list">

            {items.map(
              (notification) => (
                <article
                  className={`notification-row ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  key={
                    notification.id
                  }
                >

                  <button
                    type="button"
                    className="notification-main"
                    disabled={
                      workingId ===
                      notification.id
                    }
                    onClick={() =>
                      markRead(
                        notification
                      )
                    }
                  >

                    <div
                      className={`notification-icon ${
                        notification.notification_type ||
                        "general"
                      }`}
                    >
                      <NotificationIcon
                        type={
                          notification.notification_type
                        }
                      />
                    </div>


                    <div className="notification-content">

                      <div className="notification-title-row">

                        <strong>
                          {
                            notification.title
                          }
                        </strong>


                        {!notification.is_read && (
                          <span className="notification-unread-dot" />
                        )}

                      </div>


                      <p>
                        {
                          notification.message
                        }
                      </p>


                      <span className="notification-time">
                        {formatNotificationDate(
                          notification.created_at
                        )}
                      </span>

                    </div>

                  </button>


                  <div className="notification-actions">

                    {notification.is_read ? (
                      <button
                        type="button"
                        title="Mark unread"
                        disabled={
                          workingId ===
                          notification.id
                        }
                        onClick={() =>
                          markUnread(
                            notification
                          )
                        }
                      >
                        <Mail
                          size={16}
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        title="Mark read"
                        disabled={
                          workingId ===
                          notification.id
                        }
                        onClick={() =>
                          markRead(
                            notification
                          )
                        }
                      >
                        <Check
                          size={16}
                        />
                      </button>
                    )}


                    <button
                      type="button"
                      title="Delete"
                      className="notification-delete"
                      disabled={
                        workingId ===
                        notification.id
                      }
                      onClick={() =>
                        deleteNotification(
                          notification
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        ) : (
          <div className="notification-empty">

            <MailOpen
              size={31}
            />

            <strong>
              {filter === "unread"
                ? "No unread notifications"
                : filter === "read"
                  ? "No read notifications"
                  : "You're all caught up"}
            </strong>

            <span>
              Finora will show
              important money
              reminders here.
            </span>

          </div>
        )}

      </section>

    </div>
  );
}