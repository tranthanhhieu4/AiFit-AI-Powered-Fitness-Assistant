import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { login } from "../services/authService";

/** IDD UI-01: Login. */
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "Admin" ? "/admin" : "/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
      <form onSubmit={handleSubmit} className="rounded-card border border-border bg-white p-8">
        <h1 className="text-center text-3xl font-bold text-gold">AIFit</h1>
        <p className="text-center text-sm text-muted">AI-Powered Fitness Assistant</p>
        <h2 className="mt-4 text-center text-lg font-semibold">Login to your account</h2>

        <label className="mt-6 block text-sm font-medium text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
          placeholder="Email"
        />

        <label className="mt-4 flex items-center justify-between text-sm font-medium text-muted">
          Password
          <button type="button" className="font-semibold text-gold" onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 focus:border-gold focus:outline-none"
          placeholder="Password"
        />

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-6 w-full">
          {submitting ? "Logging in..." : "Login"}
        </Button>

        <p className="mt-4 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-semibold text-gold">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
