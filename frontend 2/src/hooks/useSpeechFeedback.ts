import { useCallback, useRef, useState } from "react";

/**
 * Wraps the Web Speech API (Proposal 3.4 "Voice Feedback Engine") with a
 * cooldown so the same correction is not spoken on every single frame
 * (Proposal 5.5 Decision Logic: "triggers both the on-screen visual cue and
 * the corresponding voice alert" - the cooldown is what keeps that from
 * becoming a constant stream of speech). Matches IDD UI-05 control #10
 * ("Voice: On/Off").
 */
const COOLDOWN_MS = 4000;
const VOICE_PREF_KEY = "aifit.voiceDefault";

export function useSpeechFeedback() {
  // Seeded from the "Voice feedback by default" preference saved on UI-08 Profile.
  const [enabled, setEnabled] = useState(() => localStorage.getItem(VOICE_PREF_KEY) !== "off");
  const lastSpokenRef = useRef<{ message: string; at: number } | null>(null);

  const speak = useCallback(
    (message: string) => {
      if (!enabled || !("speechSynthesis" in window)) return;

      const now = performance.now();
      const last = lastSpokenRef.current;
      const sameMessageTooSoon = last && last.message === message && now - last.at < COOLDOWN_MS;
      if (sameMessageTooSoon) return;

      window.speechSynthesis.cancel(); // don't queue up stale corrections
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = { message, at: now };
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) window.speechSynthesis.cancel();
      return !prev;
    });
  }, []);

  return { enabled, toggle, speak };
}
