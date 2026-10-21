import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { signUp } from "../services/authService";

/** IDD UI-02: Sign Up. Mirrors LoginPage's layout/tokens so the two feel like one flow. */
export function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await signUp(fullName, email, password);
      navigate(user.role === "Admin" ? "/admin" : "/");
    } catch {
      setError("Could not create the account. That email may already be in use.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
      <form onSubmit={handleSubmit} className="rounded-card border border-border bg-white p-8">
        <h1 className="text-center text-3xl font-bold text-gold">AIFit</h1>
        <p className="text-center text-sm text-muted">AI-Powered Fitness Assistant</p>
        <h2 className="mt-4 text-center text-lg font-semibold">Create your account</h2>

        <label className="mt-6 block text-sm font-medium text-muted">
          Full name
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
            placeholder="Your name"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-muted">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
            placeholder="Email"
          />
        </label>

        <label className="mt-4 flex items-center justify-between text-sm font-medium text-muted">
          Password
          <button type="button" className="font-semibold text-gold" onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
          placeholder="At least 8 characters"
        />

        <label className="mt-4 block text-sm font-medium text-muted">
          Confirm password
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
            placeholder="Re-enter password"
          />
        </label>

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-6 w-full">
          {submitting ? "Creating account..." : "Create account"}
        </Button>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-gold">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
