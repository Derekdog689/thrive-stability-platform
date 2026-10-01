import Link from "next/link";
import type { ReactNode } from "react";

type Scene = "morning" | "evening" | "lake" | "goal" | "story" | "support" | "meeting";

const sceneUrl: Record<Scene, string> = {
  morning:
    "https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=88&w=2200",
  evening:
    "https://images.unsplash.com/photo-1766221072212-cf2f9383221c?auto=format&fit=crop&fm=jpg&q=88&w=2200",
  lake:
    "https://images.unsplash.com/photo-1758255847444-2506073ca32e?auto=format&fit=crop&fm=jpg&q=88&w=2200",
  goal:
    "https://images.unsplash.com/photo-1770347314659-7fd45b638f87?auto=format&fit=crop&fm=jpg&q=90&w=2200",
  story:
    "https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=86&w=2200",
  support:
    "https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=84&w=2200",
  meeting:
    "https://images.unsplash.com/photo-1766221072212-cf2f9383221c?auto=format&fit=crop&fm=jpg&q=88&w=2200",
};

export function SceneHero({
  scene,
  eyebrow,
  title,
  copy,
  rightLabel,
  children,
}: {
  scene: Scene;
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  rightLabel?: string;
  children?: ReactNode;
}) {
  const dark = scene === "evening" || scene === "lake" || scene === "goal" || scene === "meeting";

  return (
    <header
      className={`ls-scene ls-scene--${scene} ${dark ? "ls-scene--dark ls-dark" : ""}`}
      style={{ backgroundImage: `url('${sceneUrl[scene]}')` }}
    >
      <span className="ls-atmosphere ls-atmosphere--mist" aria-hidden="true" />
      <span className="ls-atmosphere ls-atmosphere--light" aria-hidden="true" />
      <span className="ls-atmosphere ls-atmosphere--water" aria-hidden="true" />

      <div className="ls-scene-content">
        <div className="ls-brand">
          <div className="ls-brandmark"><span className="ls-leaf" /><span>THRIVE</span></div>
          {rightLabel ? <span className="ls-chip">{rightLabel}</span> : null}
        </div>
        <div className="ls-hero-copy-block">
          <p className="ls-kicker">{eyebrow}</p>
          <h1 className="ls-hero-title">{title}</h1>
          {copy ? <p className="ls-hero-copy">{copy}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ active }: { active: "today" | "wellness" | "goals" | "money" | "support" }) {
  const items = [
    ["today", "/living-signal/today", "⌂", "Today"],
    ["wellness", "/living-signal/wellness", "♡", "Wellness"],
    ["goals", "/living-signal/goal-completion", "◎", "Goals"],
    ["money", "/living-signal/money-closeout", "$", "Money"],
    ["support", "/living-signal/recovery", "◌", "Support"],
  ] as const;

  return (
    <nav className="ls-bottom-nav">
      {items.map(([key, href, icon, label]) => (
        <Link key={key} href={href} className={`ls-nav-item ${active === key ? "ls-nav-item--active" : ""}`}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function LaneCard({
  icon,
  iconClass,
  title,
  copy,
  href = "#",
  dark = false,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  copy: string;
  href?: string;
  dark?: boolean;
}) {
  return (
    <Link href={href} className={`ls-card ${dark ? "ls-card--dark" : ""}`}>
      <span className={`ls-icon ${iconClass}`}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="ls-card-title">{title}</span>
        <span className="ls-card-copy" style={{ display: "block" }}>{copy}</span>
      </span>
      <span className="ls-arrow">›</span>
    </Link>
  );
}

export function PreviewNotice() {
  return null;
}
