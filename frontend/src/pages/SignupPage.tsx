import { useState } from "react";
import { AuthCard, GoldButton, Field } from "../components/ui";

export default function SignupPage({ onSignup, onLogin }: { onSignup: (name: string) => void; onLogin: () => void }) {
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = () => {
    if (!f.name || !f.email || f.pw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (f.pw !== f.pw2) { setErr("Passwords do not match."); return; }
    onSignup(f.name); // mock — Phase 3: POST /api/auth/register
  };

  return (
    <AuthCard>
      <h1 className="mb-6 text-lg font-bold text-charcoal">Create your account</h1>
      <div className="space-y-4 text-left">
        <Field label="Full name" placeholder="Full name" value={f.name} onChange={set("name")} />
        <Field label="Email" type="email" placeholder="Email" value={f.email} onChange={set("email")} />
        <Field label="Password" type="password" placeholder="Password (min. 8 characters)" value={f.pw} onChange={set("pw")} />
        <Field label="Confirm password" type="password" placeholder="Confirm password" value={f.pw2} onChange={set("pw2")} />
        {err && <p className="text-xs text-error">{err}</p>}
        <GoldButton className="w-full" onClick={submit}>Sign up</GoldButton>
        <p className="text-center text-xs text-muted">
          Already have an account? <button onClick={onLogin} className="font-semibold text-gold">Login</button>
        </p>
      </div>
    </AuthCard>
  );
}