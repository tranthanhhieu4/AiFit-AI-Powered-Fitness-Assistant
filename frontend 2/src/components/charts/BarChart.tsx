import { EmptyChart } from "./LineChart";

interface Segment {
  value: number;
  color: string;
}

interface BarChartProps {
  /** Each bar is one or more stacked segments (e.g. correct + incorrect reps). */
  bars: Segment[][];
  labels?: string[];
  height?: number;
}

/**
 * Minimal dependency-free SVG stacked bar chart (sessions per day, IDD
 * UI-07/UI-10; correct vs incorrect reps per session, IDD UI-06).
 */
export function BarChart({ bars, labels, height = 160 }: BarChartProps) {
  if (bars.length === 0) return <EmptyChart height={height} />;

  const width = Math.max(320, bars.length * 48);
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const barWidth = Math.min(32, (innerWidth / bars.length) * 0.6);
  const gap = innerWidth / bars.length;

  const max = Math.max(1, ...bars.map((segments) => segments.reduce((sum, s) => sum + s.value, 0)));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Bar chart">
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#DFD1B5"
        strokeWidth={1}
      />
      {bars.map((segments, i) => {
        const cx = padding + gap * i + gap / 2;
        let yCursor = height - padding;
        return (
          <g key={i}>
            {segments.map((seg, j) => {
              const h = (seg.value / max) * innerHeight;
              yCursor -= h;
              return <rect key={j} x={cx - barWidth / 2} y={yCursor} width={barWidth} height={h} fill={seg.color} rx={2} />;
            })}
            {labels?.[i] && (
              <text x={cx} y={height - 6} fontSize={10} fill="#928067" textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
