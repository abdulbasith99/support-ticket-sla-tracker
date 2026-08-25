import type {
  ReactNode,
} from "react";

interface BadgeProps {
  tone?:
    | "neutral"
    | "blue"
    | "green"
    | "orange"
    | "red"
    | "purple";

  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  children,
}: BadgeProps) {
  return (
    <span
      className={`badge badge-${tone}`}
    >
      {children}
    </span>
  );
}