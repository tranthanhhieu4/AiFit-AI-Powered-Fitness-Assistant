import { GoldButton } from "./ui";

export default function TraineeNav({ active, name, onNav, onLogout }: {
  active: "home" | "history" | "profile";
  name: string; onNav: (s: "home" | "history" | "profile") => void; onLogout: () => void;
}) {
  const items = [["home", "Home"], ["history", "History"], ["profile", "Profile"]] as const;
  return (
    <nav className="flex items-center gap-6 border-b border-tan bg-surface px-6 py-3">
      <span className="text-xl font-bold text-gold">AIFit</span>
      <div className="ml-auto flex gap-5">
        {items.map(([id, label]) => (
          <button key={id} onClick={() => onNav(id)}
            className={`text-sm font-medium ${active === id ? "border-b-2 border-gold text-gold" : "text-charcoal hover:text-gold"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-tint text-sm font-bold text-gold">
        {name.charAt(0).toUpperCase()}
      </div>
      <GoldButton className="!px-4 !py-1.5 text-sm" onClick={onLogout}>Logout</GoldButton>
    </nav>
  );
}