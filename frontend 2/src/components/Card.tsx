import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/** Generic bordered white panel - the basic building block of every screen. */
export function Card({ title, action, children, className = "", ...rest }: CardProps) {
  return (
    <div className={`rounded-card border border-border bg-white p-5 ${className}`} {...rest}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
