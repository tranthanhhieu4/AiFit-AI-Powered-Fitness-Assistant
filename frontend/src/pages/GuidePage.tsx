import TraineeNav from "../components/TraineeNav";
import { Card, GoldButton } from "../components/ui";
import { EXERCISES } from "../data/exercises";

export default function GuidePage({ exerciseId, name, onNav, onStart, onBack, onLogout }: {
  exerciseId: string; name: string;
  onNav: (s: "home" | "history" | "profile") => void;
  onStart: () => void; onBack: () => void; onLogout: () => void;
}) {
  const ex = EXERCISES.find((e) => e.id === exerciseId)!;

  return (
    <div className="min-h-screen bg-cream">
      <TraineeNav active="home" name={name} onNav={onNav} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl space-y-5 p-6">
        <button onClick={onBack} className="text-sm font-semibold text-gold">‹ Back to exercises</button>
        <h1 className="text-xl font-bold text-charcoal">{ex.name} - Standard Posture Guide</h1>

        <div className="grid grid-cols-3 gap-5">
          <Card className="p-4">
            <video
              src={ex.videoUrl}
              controls
              loop
              muted
              playsInline
              preload="metadata"
              className="mb-3 h-40 w-full rounded-lg bg-black object-cover"
              onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
            />
            <img
              src={ex.imageUrl}
              alt={`${ex.name} reference posture`}
              className="h-36 w-full rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <p className="mt-2 text-center text-xs text-muted">Reference posture (peak flexion)</p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-sm font-bold text-charcoal">Standard posture</h2>
            <ol className="list-decimal space-y-1.5 pl-4 text-sm text-charcoal">
              {ex.instructions.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-sm font-bold text-charcoal">Camera placement</h2>
            <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-gold-tint text-3xl">📷 ↔ 🧍</div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-charcoal">
              <li>{ex.cameraGuidance}</li>
              <li>Whole body visible in the frame</li>
              <li>Good lighting, avoid backlight</li>
              <li>Video is processed in the browser and not stored</li>
            </ul>
          </Card>
        </div>

        <GoldButton className="w-full !py-3 text-base" onClick={onStart}>Start Workout</GoldButton>
      </main>
    </div>
  );
}