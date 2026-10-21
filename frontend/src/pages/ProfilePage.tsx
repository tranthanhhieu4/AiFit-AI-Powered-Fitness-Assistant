import { useState } from "react";
import TraineeNav from "../components/TraineeNav";
import { Card, Field, GoldButton } from "../components/ui";

export default function ProfilePage({ auth, onNav, onLogout, onRename }: {
  auth: { name: string; email: string };
  onNav: (s: "home" | "history" | "profile") => void; onLogout: () => void;
  onRename: (name: string) => void;
}) {
  const [nm, setNm] = useState(auth.name);
  const [msg, setMsg] = useState("");
  return (
    <div className="min-h-screen bg-cream">
      <TraineeNav active="profile" name={auth.name} onNav={onNav} onLogout={onLogout} />
      <main className="mx-auto grid max-w-4xl grid-cols-[280px_1fr] gap-5 p-6">
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold-tint text-3xl font-bold text-gold">
            {auth.name.charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 font-bold text-charcoal">{auth.name}</p>
          <p className="text-xs text-muted">{auth.email}</p>
          <button onClick={onLogout} className="mt-6 w-full rounded-lg border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error-tint">Logout</button>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-charcoal">Personal information</h2>
            <Field label="Full name" value={nm} onChange={(e) => setNm(e.target.value)} />
            <Field label="Email" value={auth.email} readOnly className="mt-3 bg-cream" />
            <GoldButton className="mt-3" onClick={() => { onRename(nm); setMsg("Saved."); }}>Save changes</GoldButton>
            {msg && <span className="ml-3 text-xs text-success">{msg}</span>}
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-charcoal">Change password</h2>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Current password" type="password" />
              <Field label="New password" type="password" />
              <Field label="Confirm new password" type="password" />
            </div>
            <GoldButton className="mt-3" onClick={() => setMsg("Password updated (mock).")}>Update password</GoldButton>
          </Card>
        </div>
      </main>
    </div>
  );
}