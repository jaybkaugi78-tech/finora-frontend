export default function ProgressBar({ value = 0 }) {
  const v = Math.min(Math.max(value, 0), 100);
  return (
    <div className="progress">
      <span style={{ width: `${v}%` }} />
    </div>
  );
}
