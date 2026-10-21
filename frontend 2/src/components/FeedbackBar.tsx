interface FeedbackBarProps {
  message: string | null;
}

/**
 * IDD UI-05 control #8: "Feedback message with the detected error and a
 * correction hint". Hidden (renders nothing) while posture is correct.
 */
export function FeedbackBar({ message }: FeedbackBarProps) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 rounded-card border border-warning bg-warning-light px-4 py-3 text-warning">
      <span aria-hidden className="text-lg">
        🔊
      </span>
      <p className="font-semibold">{message}</p>
    </div>
  );
}
