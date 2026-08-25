import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost";

  size?:
    | "sm"
    | "md"
    | "lg";

  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        className,
      ].join(" ")}
      {...props}
    >
      {icon && (
        <span className="btn-icon">
          {icon}
        </span>
      )}

      {children}
    </button>
  );
}