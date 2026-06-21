import { Link } from "react-router-dom";

export function StatCard({ value, label, variant = "primary" }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function StatsGrid({ children }) {
  return <div className="stats-grid">{children}</div>;
}

export function QuickLinks({ links }) {
  return (
    <div className="quick-links">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="btn btn-secondary">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
