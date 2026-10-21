import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-gold text-white border border-gold hover:bg-gold-dark",
  outline: "bg-white text-gold border border-gold hover:bg-gold-light",
  danger: "bg-danger text-white border border-danger hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Shared button styled from the IDD design tokens (gold / outline / danger). */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2.5 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
