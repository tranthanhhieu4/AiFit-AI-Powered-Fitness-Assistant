interface LineChartProps {
  /** 0..1 values, e.g. accuracy per session, oldest first. */
  values: number[];
  labels?: string[];
  height?: number;
}

/**
 * Minimal dependency-free SVG line chart (accuracy trend, IDD UI-07).
 * Not a charting library - just enough to plot a short series of ratios.
 */
export function LineChart({ values, labels, height = 160 }: LineChartProps) {
  if (values.length === 0) {
    return <EmptyChart height={height} />;
  }

  const width = Math.max(320, values.length * 60);
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (values.length === 1 ? innerWidth / 2 : (i / (values.length - 1)) * innerWidth);
    const y = padding + innerHeight * (1 - v);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Accuracy over time">
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#DFD1B5" strokeWidth={1} />
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#DFD1B5"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke="#BF8E2D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#FFFFFF" stroke="#BF8E2D" strokeWidth={2} />
      ))}
      {labels &&
        labels.map((label, i) => (
          <text key={label + i} x={points[i].x} y={height - 6} fontSize={10} fill="#928067" textAnchor="middle">
            {label}
          </text>
        ))}
    </svg>
  );
}

export function EmptyChart({ height = 160 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center text-sm text-muted" style={{ height }}>
      No data yet
    </div>
  );
}
