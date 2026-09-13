import { useState } from "react";
import { ArrowRight, PiggyBank } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../services/api";
export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  if (getToken()) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("finora_token", data.access_token);
      localStorage.setItem("finora_user", JSON.stringify(data.user));
      nav("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <PiggyBank size={24} />
          </div>
          <strong>FINORA</strong>
        </div>
        <div className="auth-copy">
          <span className="eyebrow light">Start with clarity</span>
          <h1>Build a better relationship with your money.</h1>
          <p>
            Create your account and bring your transactions, goals, budgets and
            bills into one calm place.
          </p>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <span className="eyebrow">Create account</span>
          <h2>Join Finora</h2>
          <form onSubmit={submit}>
            <label>
              Full name
              <input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
