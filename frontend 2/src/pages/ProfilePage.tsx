import { useState, type FormEvent } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/FormField";
import { Toggle } from "../components/Toggle";
import { getCurrentUser, updateProfile, changePassword } from "../services/authService";

const VOICE_PREF_KEY = "aifit.voiceDefault";

/** IDD UI-08 "Profile": personal info, password change, and app preferences. */
export function ProfilePage() {
  const user = getCurrentUser();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [voiceDefault, setVoiceDefault] = useState(localStorage.getItem(VOICE_PREF_KEY) !== "off");

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await updateProfile(fullName);
      setProfileMessage("Profile updated.");
    } catch {
      setProfileMessage("Could not update your profile right now.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage({ text: "New password must be at least 8 characters.", ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match.", ok: false });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({ text: "Password updated.", ok: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({ text: "Current password is incorrect.", ok: false });
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleVoiceDefault = (next: boolean) => {
    setVoiceDefault(next);
    localStorage.setItem(VOICE_PREF_KEY, next ? "on" : "off");
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Profile</h1>

      <Card title="Personal information">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 sm:max-w-sm">
          <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <TextField label="Email" value={user?.email ?? ""} disabled hint="Email cannot be changed." />
          <TextField label="Role" value={user?.role ?? ""} disabled />
          {profileMessage && (
            <p className={`text-sm font-medium ${profileMessage.startsWith("Could") ? "text-danger" : "text-success"}`}>
              {profileMessage}
            </p>
          )}
          <Button type="submit" disabled={savingProfile} className="self-start">
            {savingProfile ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 sm:max-w-sm">
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextField
            label="New password"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordMessage && (
            <p className={`text-sm font-medium ${passwordMessage.ok ? "text-success" : "text-danger"}`}>
              {passwordMessage.text}
            </p>
          )}
          <Button type="submit" disabled={savingPassword} className="self-start">
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>

      <Card title="Preferences">
        <div className="flex items-center justify-between sm:max-w-sm">
          <div>
            <p className="text-sm font-medium text-ink">Voice feedback by default</p>
            <p className="text-xs text-muted">Applies next time you start a workout (IDD UI-05).</p>
          </div>
          <Toggle checked={voiceDefault} onChange={toggleVoiceDefault} label="Voice feedback by default" />
        </div>
      </Card>
    </div>
  );
}
