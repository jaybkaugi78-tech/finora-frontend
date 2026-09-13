import { ArrowRight, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";
export default function Register() {
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
          <span className="eyebrow light">Start with clarity</span>
          <h1>Build a better relationship with your money.</h1>
          <p>
            Bring your transactions, goals, budgets and bills into one calm
            place.
          </p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <span className="eyebrow">Create account</span>
          <h2>Join Finora</h2>
          <label>
            Full name
            <input placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Create a strong password" />
          </label>
          <button className="primary full">
            Create account <ArrowRight size={18} />
          </button>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
