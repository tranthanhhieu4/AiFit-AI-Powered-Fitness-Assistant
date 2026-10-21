import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateAngle } from "./geometry/angleCalculator";
import { LM, type LandmarkPoint } from "./landmarks";

interface MockPoseFile { label?: string; landmarks?: LandmarkPoint[]; }

const EXERCISE_DIRS = ["squat", "plank", "pushup"];
const mocksRoot = fileURLToPath(new URL("../../../mocks", import.meta.url));

const modules: Record<string, MockPoseFile> = {};
for (const dir of EXERCISE_DIRS) {
  let files: string[] = [];
  try { files = readdirSync(join(mocksRoot, dir)); }
  catch { console.warn(`⚠️ Không đọc được folder: ${dir}`); continue; }
  for (const f of files) {
    if (!f.toLowerCase().endsWith(".json")) continue;
    modules[`${dir}/${f}`] = JSON.parse(readFileSync(join(mocksRoot, dir, f), "utf-8")) as MockPoseFile;
  }
}

const knee = (l: LandmarkPoint[]) => calculateAngle(l[LM.LEFT_HIP], l[LM.LEFT_KNEE], l[LM.LEFT_ANKLE]);
const elbow = (l: LandmarkPoint[]) => calculateAngle(l[LM.LEFT_SHOULDER], l[LM.LEFT_ELBOW], l[LM.LEFT_WRIST]);
const bodyline = (l: LandmarkPoint[]) => calculateAngle(l[LM.LEFT_SHOULDER], l[LM.LEFT_HIP], l[LM.LEFT_ANKLE]);

/**
 * Landmark BẮT BUỘC theo bài = đúng những điểm Evaluator sử dụng:
 * - squat: đứng → cả 2 bên phải thấy (chân trong khung)
 * - plank: nằm nghiêng → bên phải bị che là BÌNH THƯỜNG, chỉ yêu cầu bên evaluator dùng
 * - pushup: gối không tham gia đánh giá → không yêu cầu
 */
const REQUIRED_LM: Record<string, number[]> = {
  squat:  [11, 23, 25, 27, 12, 24, 26, 28],
  plank:  [11, 23, 27],
  pushup: [11, 13, 15, 23, 27],
};

const RANGES: Record<string, { metric: (l: LandmarkPoint[]) => number; min: number; max: number }> = {
  squat_top:            { metric: knee,     min: 160, max: 181 },
  squat_correct_bottom: { metric: knee,     min: 60,  max: 100 },
  squat_shallow:        { metric: knee,     min: 108, max: 150 },
  plank_correct:        { metric: bodyline, min: 165, max: 181 },
  plank_sagging:        { metric: bodyline, min: 100, max: 164 },
  plank_piking:         { metric: bodyline, min: 100, max: 164 },
  pushup_top:           { metric: elbow,    min: 155, max: 181 }, // MediaPipe đo tư thế chống tay 158–165 là chuẩn
  pushup_bottom:        { metric: elbow,    min: 55,  max: 95 },
  pushup_low_rom:       { metric: elbow,    min: 108, max: 150 },
  pushup_flare:         { metric: elbow,    min: 100, max: 181 },
};

function exerciseOf(name: string): string | undefined {
  return ["squat", "plank", "pushup"].find((k) => name.startsWith(k));
}

function auditFile(name: string, mock: MockPoseFile): string[] {
  const problems: string[] = [];
  const lms = mock.landmarks;
  if (!lms) { problems.push("thiếu landmarks"); return problems; }
  if (lms.length !== 33) problems.push(`chỉ ${lms.length} điểm (cần 33)`);

  const ex = exerciseOf(name);
  const required = ex ? REQUIRED_LM[ex] : [];
  const lowVis = required.filter((i) => (lms[i]?.visibility ?? 0) < 0.5);
  if (lowVis.length > 0) {
    problems.push(`visibility < 0.5 tại điểm bắt buộc ${lowVis.join(",")}`);
  }

  const label = Object.keys(RANGES).find((k) => name.startsWith(k));
  if (label) {
    const v = RANGES[label].metric(lms);
    const { min, max } = RANGES[label];
    const ok = v >= min && v <= max;
    console.log(`${name.padEnd(40)} ${v.toFixed(1)}° (chuẩn ${min}–${max}°) ${ok ? "✅" : "❌"}`);
    if (!ok) problems.push(`góc ${v.toFixed(1)}° ngoài khoảng ${min}–${max}°`);
  }

  if (name.startsWith("pushup_flare")) {
    const flare = calculateAngle(lms[LM.LEFT_HIP], lms[LM.LEFT_SHOULDER], lms[LM.LEFT_ELBOW]);
    console.log(`${name.padEnd(40)} flare=${flare.toFixed(1)}° (chuẩn >95°) ${flare > 95 ? "✅" : "❌"}`);
    if (flare <= 95) problems.push(`flare ${flare.toFixed(1)}° không đủ rộng — chụp ở góc CHÉCH ~45°, không 90°`);
  }
  return problems;
}

describe("CHẤT LƯỢNG MOCK — từng file", () => {
  for (const [path, mock] of Object.entries(modules)) {
    const name = basename(path);
    it(name, () => {
      const problems = auditFile(name, mock);
      expect(problems, `${name}: ${problems.join(" | ")}`).toHaveLength(0);
    });
  }
});

describe("TỔNG QUAN", () => {
  it("có đủ tối thiểu 10 file mock", () => {
    const paths = Object.keys(modules);
    console.log(`Tìm thấy ${paths.length} file mock`);
    expect(paths.length).toBeGreaterThanOrEqual(10);
  });
});