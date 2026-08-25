import type {
  ReactNode,
} from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;

  tone?:
    | "blue"
    | "orange"
    | "red"
    | "green";
}

export function StatCard({
  label,
  value,
  icon,
  tone = "blue",
}: StatCardProps) {
  return (
    <article
      className={`stat-card stat-${tone}`}
    >
      <div className="stat-card-top">
        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-label">
          {label}
        </span>
      </div>

      <strong className="stat-value">
        {value}
      </strong>

      <div className="stat-accent" />
    </article>
  );
}