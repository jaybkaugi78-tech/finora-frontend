import { useState } from "react";
import { ArrowRight, LockKeyhole, PiggyBank } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../services/api";
export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  if (getToken()) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/auth/login", {
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
          <span className="eyebrow light">Personal finance, simplified</span>
          <h1>Know exactly where your money stands.</h1>
          <p>
            Track spending, plan smarter and build your financial future with
            clarity.
          </p>
        </div>
        <div className="auth-highlight">
          <span>Finora</span>
          <strong>Your money, clearly.</strong>
          <small>One calm place for your financial life.</small>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-lock">
            <LockKeyhole size={20} />
          </div>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to Finora</h2>
          <form onSubmit={submit}>
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="auth-switch">
            New to Finora? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
