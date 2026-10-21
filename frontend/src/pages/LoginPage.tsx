import { useState } from "react";
import { AuthCard, GoldButton, Field } from "../components/ui";

export default function LoginPage({ onLogin, onSignup }: {
  onLogin: (email: string) => void; onSignup: () => void;
}) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(false);

  const submit = () => {
    if (!email || pw.length < 1) { setErr(true); return; }
    onLogin(email); // mock auth — Phase 3: POST /api/auth/login
  };

  return (
    <AuthCard>
      <h1 className="mb-6 text-lg font-bold text-charcoal">Login to your account</h1>
      <div className="space-y-4 text-left">
        <Field label="Email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* Password với nút Show nằm TRONG khung input (đúng UI-01 IDD) */}
        <div>
          <span className="mb-1 block text-xs font-semibold text-charcoal">Password</span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-lg border border-tan bg-surface px-3 py-2 pr-14 text-sm text-charcoal outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gold hover:text-gold-dark"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {err && <p className="text-xs text-error">Invalid email or password.</p>}
        <GoldButton className="w-full" onClick={submit}>Login</GoldButton>
        <p className="text-center text-xs text-muted">
          Don't have an account?{" "}
          <button onClick={onSignup} className="font-semibold text-gold">Sign up</button>
        </p>
      </div>
    </AuthCard>
  );
}