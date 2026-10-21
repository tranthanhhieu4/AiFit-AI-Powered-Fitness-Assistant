import TraineeNav from "../components/TraineeNav";
import { Card, GoldButton, OutlineButton, fmtDate, fmtDur } from "../components/ui";
import { EXERCISES } from "../data/exercises";
import type { SessionRow } from "../data/mock";

export default function HomePage({ name, lastSession, sessions, onNav, onSelect, onLogout }: {
  name: string; lastSession: SessionRow | null; sessions: SessionRow[];
  onNav: (s: "home" | "history" | "profile") => void;
  onSelect: (id: string) => void; onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <TraineeNav active="home" name={name} onNav={onNav} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl space-y-5 p-6">
        <Card className="p-5">
          <h1 className="text-xl font-bold text-charcoal">Welcome back, {name.split(" ")[0]}</h1>
          <p className="text-sm text-muted">Choose an exercise to start your workout</p>
        </Card>

        <div className="grid grid-cols-3 gap-5">
          {EXERCISES.map((ex) => (
            <Card key={ex.id} className="group overflow-hidden">
              <div className="relative h-40 overflow-hidden bg-gold-tint">
                <img
                  src={ex.imageUrl}
                  alt={`${ex.name} standard posture`}
                  className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <video
                  src={ex.videoUrl}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                />
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  ▶ Preview
                </span>
              </div>
              <div className="p-4">
                <div className="font-bold text-charcoal">{ex.name}</div>
                <div className="mb-3 text-xs text-muted">{ex.jointSet}</div>
                <GoldButton className="w-full !py-1.5 text-sm" onClick={() => onSelect(ex.id)}>Select</GoldButton>
              </div>
            </Card>
          ))}
        </div>

        {lastSession && (
          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-sm font-bold text-charcoal">Last session</div>
              <p className="mt-1 text-xs text-muted">
                {EXERCISES.find((e) => e.id === lastSession.exerciseId)?.name} | {fmtDate(lastSession.date)} |{" "}
                {lastSession.total} reps ({lastSession.correct} correct, {lastSession.incorrect} incorrect) |{" "}
                Accuracy {lastSession.accuracy}%
              </p>
              <p className="text-xs text-muted">Duration {fmtDur(lastSession.durationSec)}</p>
            </div>
            <OutlineButton className="text-xs" onClick={() => onNav("history")}>View all history ›</OutlineButton>
          </Card>
        )}
      </main>
    </div>
  );
}