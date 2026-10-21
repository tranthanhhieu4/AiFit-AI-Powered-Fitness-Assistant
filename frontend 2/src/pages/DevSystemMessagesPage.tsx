import { Card } from "../components/Card";
import { CameraPermissionDenied, BodyNotDetectedBanner, ConnectionLostBanner } from "../components/SystemMessages";

/**
 * IDD UI-09 "System Messages" reference screen. The three states it
 * describes are not a standalone page in the real flow - they are wired in
 * where they actually occur ((a)/(b) inside LiveWorkoutPage over the camera
 * view, (c) inside WorkoutSummaryPage when a save fails) - this page just
 * renders all three together for QA/design review, matching the IDD mockup.
 */
export function DevSystemMessagesPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">System Messages (UI-09 reference)</h1>

      <Card title="(a) Camera permission denied - shown in place of the camera on UI-05">
        <CameraPermissionDenied onRetry={() => {}} onBack={() => {}} />
      </Card>

      <Card title="(b) Body not detected - overlaid on the camera view on UI-05">
        <div className="relative h-40 overflow-hidden rounded-card bg-black">
          <BodyNotDetectedBanner />
        </div>
      </Card>

      <Card title="(c) Connection lost / offline - shown on UI-06 when saving a session fails">
        <ConnectionLostBanner onRetrySync={() => {}} />
      </Card>
    </div>
  );
}
