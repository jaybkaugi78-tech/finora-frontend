
import { useState } from "react";
import { ArrowRight, PiggyBank } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiFetch, getToken, clearSession } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function submit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const token = data.access_token ?? data.token;

      // Some backends register and sign in immediately.
      if (typeof token === "string" && token.trim()) {
        if (!data.user || typeof data.user !== "object") {
          throw new Error(
            "Account created, but the server did not return user information."
          );
        }

        clearSession();

        localStorage.setItem("finora_token", token);
        localStorage.setItem(
          "finora_user",
          JSON.stringify(data.user)
        );

        navigate("/", { replace: true });
        return;
      }

      // Other backends require login after registration.
      clearSession();

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create your account.");
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
          <span className="eyebrow light">
            Start with clarity
          </span>

          <h1>Build a better relationship with your money.</h1>

          <p>
            Create your account and bring your transactions,
            goals, budgets and bills into one calm place.
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
                type="text"
                autoComplete="name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="new-password"
                minLength={10}
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                required
              />
            </label>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
