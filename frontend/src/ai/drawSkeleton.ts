import { SKELETON_EDGES, type LandmarkPoint } from "./landmarks";

const VISIBILITY_THRESHOLD = 0.5;

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  color = "#22d3ee",
): void {
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;

  for (const [a, b] of SKELETON_EDGES) {
    const pa = landmarks[a], pb = landmarks[b];
    if (!pa || !pb) continue;
    if (pa.visibility < VISIBILITY_THRESHOLD || pb.visibility < VISIBILITY_THRESHOLD) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * width, pa.y * height);
    ctx.lineTo(pb.x * width, pb.y * height);
    ctx.stroke();
  }

  ctx.fillStyle = "#fbbf24";
  for (const p of landmarks) {
    if (p.visibility < VISIBILITY_THRESHOLD) continue;
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}