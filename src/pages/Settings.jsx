import { useEffect, useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearSession } from "../services/api";
export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
      full_name: "",
      currency: "KES",
      country: "Kenya",
      timezone: "Africa/Nairobi",
    }),
    [msg, setMsg] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    apiFetch("/users/me")
      .then(({ user }) =>
        setForm({
          full_name: user.full_name || "",
          currency: user.currency || "KES",
          country: user.country || "",
          timezone: user.timezone || "",
        }),
      )
      .catch((e) => setError(e.message));
  }, []);
  async function save(e) {
    e.preventDefault();
    try {
      const { user } = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      localStorage.setItem("finora_user", JSON.stringify(user));
      setMsg("Profile updated.");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Your Finora account</span>
          <h1>Settings</h1>
          <p>Profile, currency and session controls.</p>
        </div>
      </section>
      {error && <div className="auth-error">{error}</div>}
      {msg && <div className="success-message">{msg}</div>}
      <form className="panel form-card" onSubmit={save}>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </label>
          <label>
            Currency
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label>
            Country
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </label>
          <label>
            Timezone
            <input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            />
          </label>
        </div>
        <button className="primary-button">
          <Save size={17} />
          Save settings
        </button>
      </form>
      <section className="panel security-card">
        <button
          className="secondary-button"
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </section>
    </div>
  );
}
