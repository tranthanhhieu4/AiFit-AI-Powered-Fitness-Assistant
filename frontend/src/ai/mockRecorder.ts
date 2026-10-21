import type { LandmarkPoint } from "./landmarks";

export function downloadMock(
  landmarks: LandmarkPoint[],
  label: string,
  capturedBy = "unknown",
  notes = "",
): void {
  const payload = { label, capturedAt: new Date().toISOString(), capturedBy, notes, landmarks };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${label}_${capturedBy}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}