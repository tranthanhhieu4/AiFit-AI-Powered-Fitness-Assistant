import { useEffect, useRef, type RefObject } from "react";
import type { RawLandmark } from "../ai/geometry/landmarks";
import { LANDMARK } from "../ai/geometry/landmarks";
import type { FrameEvaluation } from "../ai/evaluators/types";

/** Bone pairs drawn as green connecting lines (a side-view subset is enough). */
const BONES: [number, number][] = [
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_ELBOW],
  [LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_WRIST],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_ELBOW],
  [LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_WRIST],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP],
  [LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP],
  [LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE],
  [LANDMARK.LEFT_KNEE, LANDMARK.LEFT_ANKLE],
  [LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE],
  [LANDMARK.RIGHT_KNEE, LANDMARK.RIGHT_ANKLE],
];

// Joints that get a tooltip drawn next to them map to these landmark indices
// (left side shown; the evaluator already picked whichever side is visible).
const JOINT_INDEX: Record<string, number> = {
  shoulder: LANDMARK.LEFT_SHOULDER,
  elbow: LANDMARK.LEFT_ELBOW,
  wrist: LANDMARK.LEFT_WRIST,
  hip: LANDMARK.LEFT_HIP,
  knee: LANDMARK.LEFT_KNEE,
  ankle: LANDMARK.LEFT_ANKLE,
};

interface SkeletonOverlayProps {
  videoRef: RefObject<HTMLVideoElement>;
  /** Mutable ref updated every camera frame by useWorkoutSession - see that hook. */
  landmarksRef: RefObject<RawLandmark[] | null>;
  evaluation: FrameEvaluation | null;
}

/**
 * Draws the pose skeleton (IDD UI-05 control #1) directly on top of the
 * <video> element using an absolutely-positioned <canvas>. Runs its own
 * requestAnimationFrame loop reading landmarksRef so it stays at full
 * camera frame rate regardless of how often the worker resolves a new
 * classification (NFR01 Performance).
 */
export function SkeletonOverlay({ videoRef, landmarksRef, evaluation }: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let rafId: number;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.videoWidth === 0) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = landmarksRef.current;
      if (!landmarks) return;

      const toPixel = (p: RawLandmark) => ({ x: p.x * canvas.width, y: p.y * canvas.height });
      const flaggedJoints = new Set(evaluation?.tooltips.filter((t) => t.flagged).map((t) => JOINT_INDEX[t.joint]));

      // Bones.
      ctx.strokeStyle = "#43C57A";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      for (const [a, b] of BONES) {
        const pa = landmarks[a];
        const pb = landmarks[b];
        if (!pa || !pb) continue;
        const { x: x1, y: y1 } = toPixel(pa);
        const { x: x2, y: y2 } = toPixel(pb);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Joints.
      landmarks.forEach((lm, index) => {
        if ((lm.visibility ?? 1) < 0.5) return;
        const { x, y } = toPixel(lm);
        const isFlagged = flaggedJoints.has(index);
        ctx.beginPath();
        ctx.arc(x, y, isFlagged ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isFlagged ? "#B54C3D" : "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#43C57A";
        ctx.stroke();
      });

      // Tooltip pills for flagged joints.
      evaluation?.tooltips.forEach((tip) => {
        const lm = landmarks[JOINT_INDEX[tip.joint]];
        if (!lm) return;
        const { x, y } = toPixel(lm);
        drawTooltip(ctx, x + 16, y - 16, tip.text, tip.flagged);
      });
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [videoRef, landmarksRef, evaluation]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

function drawTooltip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, flagged: boolean) {
  ctx.font = "600 14px Inter, sans-serif";
  const paddingX = 10;
  const width = ctx.measureText(text).width + paddingX * 2;
  const height = 28;

  ctx.fillStyle = "rgba(30, 24, 16, 0.85)";
  roundRect(ctx, x, y - height / 2, width, height, 8);
  ctx.fill();

  if (flagged) {
    ctx.strokeStyle = "#B54C3D";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y - height / 2, width, height, 8);
    ctx.stroke();
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + paddingX, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
