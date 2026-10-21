import type { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

/**
 * Thin styled primitives shared by every data table in the app (UI-07, UI-11,
 * UI-12, UI-13, UI-15). Pages still compose their own <table>/<tr> markup -
 * these just keep the classNames (and therefore the look) consistent.
 */
export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table {...props} className={`w-full border-collapse text-sm ${props.className ?? ""}`} />
    </div>
  );
}

export function Th(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={`border-b border-border bg-gold-light/60 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink ${props.className ?? ""}`}
    />
  );
}

export function Td(props: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={`border-b border-border px-3 py-2.5 align-middle ${props.className ?? ""}`} />;
}
