import type {
  ReactNode,
} from "react";

import {
  Inbox,
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={28} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {action}
    </div>
  );
}