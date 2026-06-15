type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "muted";
};

const tones = {
  default: "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]",
  success: "bg-[var(--success-bg)] text-[var(--success)] border-emerald-200",
  muted: "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
