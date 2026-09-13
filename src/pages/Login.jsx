import { ArrowRight, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";
export default function Login() {
  return (
    <div className="auth">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="brand-mark">
            <PiggyBank size={22} />
          </div>
          <strong>FINORA</strong>
        </div>
        <div>
          <span className="eyebrow light">Personal finance, simplified</span>
          <h1>Know exactly where your money stands.</h1>
          <p>
            Track spending, plan smarter and build your financial future with
            clarity.
          </p>
        </div>
        <div className="safe-card auth-safe">
          <div>
            <span>Safe to spend</span>
            <strong>KSh 13,650</strong>
            <small>Calculated after bills and savings</small>
          </div>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to Finora</h2>
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary full">
            Sign in <ArrowRight size={18} />
          </button>
          <p>
            New to Finora? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
