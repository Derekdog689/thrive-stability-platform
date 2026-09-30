import Link from "next/link";
import type { ReactNode } from "react";

type Scene = "morning" | "evening" | "lake";

const sceneUrl: Record<Scene, string> = {
  morning: "/living-signal/sunrise-valley.svg",
  evening: "/living-signal/evening-sanctuary.svg",
  lake: "/living-signal/teal-lake.svg",
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
  const dark = scene !== "morning";
  return (
    <header
      className={`ls-scene ${dark ? "ls-scene--dark ls-dark" : ""}`}
      style={{ backgroundImage: `url('${sceneUrl[scene]}')` }}
    >
      <div className="ls-scene-content">
        <div className="ls-brand">
          <div className="ls-brandmark"><span className="ls-leaf" /><span>THRIVE</span></div>
          {rightLabel ? <span className="ls-chip">{rightLabel}</span> : null}
        </div>
        <div>
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
  return (
    <div style={{ margin: "0 auto 10px", width: "min(100%,760px)", padding: "10px 14px", fontSize: 12, fontWeight: 900, color: "#52606f" }}>
      Visual-first candidate · controlled preview data · production untouched
    </div>
  );
}
