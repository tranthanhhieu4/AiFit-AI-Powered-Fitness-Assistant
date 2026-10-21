export interface SessionRow {
  id: number; date: string; exerciseId: string; durationSec: number;
  total: number; correct: number; incorrect: number; accuracy: number;
  reps: { index: number; correct: boolean }[];
  errors: { label: string; count: number }[];
}

const day = 86400000;
const d = (ago: number) => new Date(Date.now() - ago * day).toISOString().slice(0, 10);

export const MOCK_SESSIONS: SessionRow[] = [
  { id: 1, date: d(0), exerciseId: "squat", durationSec: 45, total: 12, correct: 10, incorrect: 2, accuracy: 83,
    reps: Array.from({ length: 12 }, (_, i) => ({ index: i + 1, correct: i !== 3 && i !== 9 })),
    errors: [{ label: "Shallow depth", count: 2 }] },
  { id: 2, date: d(1), exerciseId: "plank", durationSec: 62, total: 1, correct: 1, incorrect: 0, accuracy: 100,
    reps: [{ index: 1, correct: true }], errors: [] },
  { id: 3, date: d(3), exerciseId: "pushup", durationSec: 72, total: 14, correct: 11, incorrect: 3, accuracy: 79,
    reps: Array.from({ length: 14 }, (_, i) => ({ index: i + 1, correct: i % 5 !== 4 })),
    errors: [{ label: "Insufficient ROM", count: 2 }, { label: "Elbow flare", count: 1 }] },
  { id: 4, date: d(7), exerciseId: "squat", durationSec: 51, total: 15, correct: 13, incorrect: 2, accuracy: 87,
    reps: Array.from({ length: 15 }, (_, i) => ({ index: i + 1, correct: i !== 6 && i !== 12 })),
    errors: [{ label: "Shallow depth", count: 2 }] },
  { id: 5, date: d(12), exerciseId: "plank", durationSec: 55, total: 1, correct: 0, incorrect: 1, accuracy: 0,
    reps: [{ index: 1, correct: false }], errors: [{ label: "Hips sagging", count: 1 }] },
];

export const MOCK_USERS = [
  { id: 1, name: "Alex Nguyen", email: "alex@example.com", role: "Trainee", created: "12/09/2026" },
  { id: 2, name: "Linh Tran", email: "linh@example.com", role: "Trainee", created: "13/09/2026" },
  { id: 3, name: "Minh Pham", email: "minh@example.com", role: "Trainee", created: "14/09/2026" },
  { id: 4, name: "Hoa Le", email: "hoa@example.com", role: "Trainee", created: "15/09/2026" },
  { id: 5, name: "Khoa Vo", email: "khoa@example.com", role: "Trainee", created: "16/09/2026" },
];

export const MOCK_LOGS = [
  { time: `${d(0)} 08:14`, user: "alex@example.com", exercise: "Squat", type: "Camera denied", message: "Permission denied by the browser" },
  { time: `${d(0)} 09:21`, user: "linh@example.com", exercise: "Plank", type: "Body lost", message: "Landmark visibility below min" },
  { time: `${d(1)} 10:59`, user: "minh@example.com", exercise: "Push-up", type: "Sync failed", message: "Session upload timed out" },
  { time: `${d(2)} 21:47`, user: "hoa@example.com", exercise: "Squat", type: "API error", message: "401 Unauthorized (token expired)" },
  { time: `${d(3)} 18:20`, user: "khoa@example.com", exercise: "Plank", type: "Body lost", message: "Landmark visibility below min" },
];

export const MOCK_DETECTION_QUALITY = [
  { exercise: "Squat", avgVis: "0.93", avgFps: 27, bodyLost: 4 },
  { exercise: "Plank", avgVis: "0.89", avgFps: 28, bodyLost: 1 },
  { exercise: "Push-up", avgVis: "0.91", avgFps: 26, bodyLost: 3 },
];