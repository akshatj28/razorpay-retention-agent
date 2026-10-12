import { Alert, Badge, Heading, Text, AlertTriangleIcon, CheckCircleIcon, SlashIcon, SparklesIcon, XCircleIcon } from "@razorpay/blade/components";
import type { ComponentProps, ReactNode } from "react";
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

export function Pill({ t = "neutral", icon, children, className }: { t?: keyof typeof tone; icon?: ComponentProps<typeof Badge>["icon"]; children: string | number | (string | number)[]; className?: string }) {
  const color = { success: "positive", warning: "notice", danger: "negative", info: "information", neutral: "neutral" } as const;
  return <span className={cn("inline-flex align-middle", className)}><Badge size="small" color={color[t]} {...(icon ? { icon } : {})}>{children}</Badge></span>;
}

export function CheckPill({ s }: { s: CheckStatus }) {
  if (s === "passed") return <Pill t="success" icon={CheckCircleIcon}>Passed</Pill>;
  if (s === "review") return <Pill t="warning" icon={AlertTriangleIcon}>Needs review</Pill>;
  return <Pill t="danger" icon={XCircleIcon}>Blocked</Pill>;
}

export function EligibilityPill({ s }: { s: Eligibility }) {
  if (s === "eligible") return <Pill t="success" icon={CheckCircleIcon}>Eligible</Pill>;
  if (s === "review") return <Pill t="warning" icon={AlertTriangleIcon}>Needs review</Pill>;
  return <Pill t="neutral" icon={SlashIcon}>Excluded</Pill>;
}

export function RecLabel({ children = "Agent recommendation · simulated" }: { children?: string }) {
  return <Pill t="info" icon={SparklesIcon}>{children}</Pill>;
}

export function Note({ children, t = "info" }: { children: ReactNode; t?: "info" | "warning" }) {
  return <Alert color={t === "warning" ? "notice" : "information"} isDismissible={false} isFullWidth description={<span>{children}</span>} />;
}

export function Stat({ label, value, hint, kind }: { label: string; value: ReactNode; hint?: ReactNode; kind?: "observed" | "derived" | "forecast" }) {
  return (
    <div className="min-w-0">
      <div className="label-text flex items-center gap-1.5">{label}{kind && <KindTag kind={kind} />}</div>
      <div className="num mt-1.5"><Heading as="span" size="large">{value}</Heading></div>
      {hint && <Text size="xsmall" color="surface.text.gray.muted" marginTop="spacing.1">{hint}</Text>}
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
        <Heading as="h1" size="xlarge">{title}</Heading>
        {subtitle && <Text as="div" size="small" color="surface.text.gray.muted" marginTop="spacing.2">{subtitle}</Text>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
