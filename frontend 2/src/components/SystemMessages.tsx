import { Button } from "./Button";

/**
 * The 3 system-message states from IDD UI-09. Each is used where it
 * actually occurs - (a) and (b) inside LiveWorkoutPage over the camera
 * view, (c) inside WorkoutSummaryPage when saving the session fails - and
 * also demoed together on DevSystemMessagesPage for reference/QA.
 */

export function CameraPermissionDenied({ onRetry, onBack }: { onRetry: () => void; onBack?: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-card border border-border bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-light text-2xl font-bold text-danger">
        !
      </div>
      <h2 className="text-xl font-bold">Camera access denied</h2>
      <p className="mt-2 text-sm text-muted">
        AIFit needs your camera to analyze your posture. Allow camera access in your browser settings, then try
        again.
      </p>
      <Button className="mt-5 w-full" onClick={onRetry}>
        Try again
      </Button>
      {onBack && (
        <button className="mt-3 text-sm font-semibold text-gold" onClick={onBack}>
          Back to exercises
        </button>
      )}
    </div>
  );
}

export function BodyNotDetectedBanner() {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-warning-light/95 px-4 py-3 text-center text-warning">
      <p className="font-semibold">Body not detected</p>
      <p className="text-sm">Step back so your whole body is visible</p>
    </div>
  );
}

export function ConnectionLostBanner({ onRetrySync }: { onRetrySync: () => void }) {
  return (
    <div className="rounded-card border border-danger bg-danger-light p-4 text-center">
      <p className="font-semibold text-danger">Offline</p>
      <p className="text-sm text-ink">Results will be synced when the connection returns</p>
      <p className="mt-1 text-xs text-muted">Workout data kept locally</p>
      <Button variant="outline" className="mt-3" onClick={onRetrySync}>
        Retry sync
      </Button>
    </div>
  );
}
