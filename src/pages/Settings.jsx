import { ChevronRight, Moon, ShieldCheck, UserRound } from "lucide-react";
const rows = [
  [UserRound, "Profile", "Personal details, currency and preferences"],
  [Moon, "Appearance", "Dark mode and display settings"],
  [ShieldCheck, "Security", "Password, sessions and data protection"],
];
export default function Settings() {
  return (
    <div className="content">
      <section className="heading">
        <div>
          <span className="eyebrow">Personalize Finora</span>
          <h1>Settings</h1>
          <p>Control your profile, privacy and experience.</p>
        </div>
      </section>
      <section className="panel settings">
        {rows.map(([Icon, title, text]) => (
          <button key={title}>
            <div className="round-icon">
              <Icon size={20} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
            <ChevronRight size={19} />
          </button>
        ))}
      </section>
    </div>
  );
}
