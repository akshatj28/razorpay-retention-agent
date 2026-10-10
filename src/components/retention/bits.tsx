import { AlertTriangle, CheckCircle2, CircleSlash, Info, Sparkles, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Eligibility } from "@/retention/features";
import type { CheckStatus } from "@/retention/policy";

const tone = {
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-destructive-subtle text-destructive",
  info: "bg-primary-subtle text-primary",
  neutral: "bg-muted text-muted-foreground",
} as const;

export function Pill({ t = "neutral", icon, children, className }: { t?: keyof typeof tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", tone[t], className)}>{icon}{children}</span>;
}

export function CheckPill({ s }: { s: CheckStatus }) {
  if (s === "passed") return <Pill t="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />}>Passed</Pill>;
  if (s === "review") return <Pill t="warning" icon={<AlertTriangle className="size-3.5" aria-hidden />}>Needs review</Pill>;
  return <Pill t="danger" icon={<XCircle className="size-3.5" aria-hidden />}>Blocked</Pill>;
}

export function EligibilityPill({ s }: { s: Eligibility }) {
  if (s === "eligible") return <Pill t="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />}>Eligible</Pill>;
  if (s === "review") return <Pill t="warning" icon={<AlertTriangle className="size-3.5" aria-hidden />}>Needs review</Pill>;
  return <Pill t="neutral" icon={<CircleSlash className="size-3.5" aria-hidden />}>Excluded</Pill>;
}

export function RecLabel({ children = "Agent recommendation · simulated" }: { children?: ReactNode }) {
  return <Pill t="info" icon={<Sparkles className="size-3.5" aria-hidden />}>{children}</Pill>;
}

export function Note({ children, t = "info" }: { children: ReactNode; t?: "info" | "warning" }) {
  return (
    <p className={cn("flex gap-2 rounded-md px-3 py-2 text-xs leading-relaxed", t === "info" ? "bg-muted text-muted-foreground" : "bg-warning-subtle text-warning")}>
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Stat({ label, value, hint, kind }: { label: string; value: ReactNode; hint?: ReactNode; kind?: "observed" | "derived" | "forecast" }) {
  return (
    <div className="min-w-0">
      <div className="label-text flex items-center gap-1.5">{label}{kind && <KindTag kind={kind} />}</div>
      <div className="num mt-0.5 text-xl font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function KindTag({ kind }: { kind: "observed" | "derived" | "forecast" }) {
  const m = { observed: ["Observed", "neutral"], derived: ["Derived", "info"], forecast: ["Illustrative forecast", "warning"] } as const;
  return <Pill t={m[kind][1]} className="px-1 py-0 text-[10px] uppercase tracking-wide">{m[kind][0]}</Pill>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between max-sm:grid-cols-1">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
