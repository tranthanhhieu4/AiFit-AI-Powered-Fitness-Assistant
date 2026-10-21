# AIFit Frontend (reference implementation)

This fills in the previously-empty `frontend/` skeleton with a working
reference implementation of the client-side "closed loop" described in the
Project Proposal (section 1.3):

```
Camera -> MediaPipe Pose -> Joint Extraction -> Vector Angle Calculation
-> Posture Evaluation -> Audio Alert -> Result Storage -> Statistics
```

All **15 IDD screens** (UI-01..UI-15) are implemented against a shared
AI engine, hook layer, service layer and design system - see the table
below for where each one lives. There is still no real backend (`AIFit.Api`
is out of scope here), so every service call in `src/services/` targets the
REST endpoints the Architecture Design describes; anything that fails
(because there's nothing at `/api` yet) degrades gracefully - exercise
catalog/rules fall back to the bundled defaults, lists render an empty
state, and a failed session save is queued locally and retried (UI-09(c)).

## Getting started

```bash
cd frontend
npm install
cp .env.example .env
# download pose_landmarker_lite.task into public/models/ (see public/models/README.md)
npm run dev
```

The dev server proxies `/api/*` to `https://localhost:5001` (the
AIFit.Api backend) - adjust `vite.config.ts` if your backend runs
elsewhere. Without a backend, log in/sign up will fail against `/api/auth/*`
- point `VITE_API_BASE_URL` at a running `AIFit.Api`, or mock those two
endpoints, to get past UI-01/UI-02.

## How the folders map to the project documents

| Folder | Maps to | Notes |
|---|---|---|
| `src/ai/geometry/` | Proposal 4.4 "Posture Analysis Engine - Vector Geometry Formula" | `jointAngleDegrees()` is the dot-product formula, used by every evaluator. |
| `src/ai/evaluators/` | Proposal 5.3-5.5 (rules, thresholds, decision logic), IDD UI-13/UI-14 | One evaluator file per exercise; `exerciseRules.ts` mirrors the ExerciseRules DB table; `repCounter.ts` is the rep state machine. |
| `src/workers/` | Architecture Design NFR01 "Performance" | Moves the per-frame rule-matching math off the main thread so the camera/canvas stay smooth. |
| `src/hooks/` | Architecture Design C&C view ("AI Pose Estimation Engine", "Real-Time Feedback Engine") | `useCamera`, `usePoseLandmarker`, `useSpeechFeedback`, and the top-level `useWorkoutSession` orchestrator (now also tracks `repHistory`/`errorBreakdown` for UI-06). |
| `src/services/` | Architecture Design "API Client Module" | Axios client + JWT/user caching, Auth/Exercise/Workout/Admin services matching the backend's planned endpoints. |
| `src/lib/` | - | Shared formatting (`format.ts`) and static exercise metadata (`exerciseMeta.ts`) used across pages. |
| `src/components/` | IDD section 3 "General Interface Guidelines" | Design-system building blocks: `Button`, `Card`, `StatCard`, `FeedbackBar`, `SkeletonOverlay`, `TopNav`, `table.tsx` (Table/Th/Td), `FormField.tsx` (TextField/SelectField), `Toggle`, `ConfirmDialog`, `charts/LineChart` + `charts/BarChart` (dependency-free SVG charts), `SystemMessages.tsx` (UI-09's three states), `AdminSidebar`/`AdminLayout` (Admin chrome). |
| `src/pages/` | IDD UI-01..UI-09 | See the screen map below. |
| `src/pages/admin/` | IDD UI-10..UI-15 | Admin screens, gated by `RequireAdmin` in `App.tsx` (checks the cached user's `role` claim). |

## Screen map (IDD UI-01 .. UI-15)

| Screen | Route | File |
|---|---|---|
| UI-01 Login | `/login` | `src/pages/LoginPage.tsx` |
| UI-02 Sign Up | `/signup` | `src/pages/SignUpPage.tsx` |
| UI-03 Home | `/` | `src/pages/HomePage.tsx` |
| UI-04 Exercise Guide | `/exercise/:exerciseId` | `src/pages/ExerciseGuidePage.tsx` |
| UI-05 Live Workout | `/workout/:exerciseId` | `src/pages/LiveWorkoutPage.tsx` |
| UI-06 Workout Summary | `/workout/:exerciseId/summary` (live) and `/history/:sessionId` (read-only detail) | `src/pages/WorkoutSummaryPage.tsx` |
| UI-07 Progress & History | `/history` | `src/pages/ProgressHistoryPage.tsx` |
| UI-08 Profile | `/profile` | `src/pages/ProfilePage.tsx` |
| UI-09 System Messages | wired into UI-05 (camera denied, body not detected) and UI-06 (offline/retry sync); also demoed together at `/dev/system-messages` | `src/components/SystemMessages.tsx`, `src/pages/DevSystemMessagesPage.tsx` |
| UI-10 Admin Dashboard | `/admin` | `src/pages/admin/AdminDashboardPage.tsx` |
| UI-11 Manage Users | `/admin/users` | `src/pages/admin/ManageUsersPage.tsx` |
| UI-12 Manage Exercises | `/admin/exercises` | `src/pages/admin/ManageExercisesPage.tsx` |
| UI-13 Manage Exercise Rules | `/admin/rules` | `src/pages/admin/ManageExerciseRulesPage.tsx` |
| UI-14 Add/Edit Rule | `/admin/rules/new`, `/admin/rules/:ruleId/edit` | `src/pages/admin/AddEditRulePage.tsx` |
| UI-15 System Logs | `/admin/logs` | `src/pages/admin/SystemLogsPage.tsx` |

## Adding a 4th exercise

This is the Architecture Design's "Modifiability" scenario (section 2.4,
scenario B). To add e.g. "Lunge" without touching the math engine:

1. Add its rows to `exerciseRules.ts` (or have an Admin add them via
   UI-13/UI-14 once the backend exists).
2. Add `lungeEvaluator.ts` next to the existing three, using the same
   `jointAngleDegrees()` / `evaluateMetric()` helpers.
3. Register it in `evaluate.ts`'s switch statement.
4. Add `"lunge"` to `ExerciseId` in `types.ts`, and an entry in
   `src/lib/exerciseMeta.ts` (name, joint set, guide/camera tips) so UI-03
   and UI-04 pick it up automatically.

`vector.ts`, `ruleMatcher.ts`, the hooks, the worker and every page are
exercise-agnostic and need no changes.

## What is intentionally left out of this reference

- A real backend (`AIFit.Api`) - every `src/services/*.ts` call is written
  against the endpoints the Architecture Design specifies, but nothing is
  actually listening yet.
- A state-management layer beyond component state + the service layer (the
  `zustand` dependency is included but unused - the Admin CRUD screens use
  local component state plus a `load()`/refetch pattern instead).
- Automated tests (Project Plan Sprint 5 "Quality Evaluation").
- Server-persisted per-repetition detail: `WorkoutSessionResult` already
  carries `repHistory`/`errorBreakdown` for a freshly finished session, but
  `WorkoutHistoryItem` (GET `/workout-sessions`) marks the same two fields
  optional until the backend actually stores and returns them for past
  sessions.
