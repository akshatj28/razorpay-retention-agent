import { AppModal } from "./AppModal";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  ChevronDown,
  ClipboardCheck,
  FlaskConical,
  LayoutGrid,
  Plug,
  RotateCcw,
  Store,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button, RefreshIcon } from "@razorpay/blade/components";
import { useDemo } from "@/retention/store";
import { Pill } from "./bits";
import { EvaluatorTour } from "./EvaluatorTour";

const NAV = [
  { to: "/setup", label: "Connect store", icon: Plug },
  { to: "/", label: "Today", icon: LayoutGrid },
  { to: "/campaigns", label: "Campaigns", icon: ClipboardCheck },
  { to: "/database", label: "Order data", icon: Store },
  { to: "/insights", label: "Compare strategies", icon: FlaskConical },
] as const;

const CRUMB: Record<string, string> = {
  "/campaigns": "Campaigns",
  "/database": "Order data",
  "/insights": "Compare strategies",
  "/setup": "Connect store",
  "/": "Today",
  "/cohort": "Cohort intelligence",
  "/workbench": "Decision workbench",
  "/review": "Review & execution",
};

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { reset, state, update } = useDemo();
  const [done, setDone] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <div className="app-shell flex min-h-screen flex-col lg:flex-row">
      <aside className="app-sidebar flex w-full shrink-0 flex-col border-b bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-r">
        <div className="border-b p-3">
          <div className="mb-5 flex items-center gap-2 px-1 font-heading text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-5" aria-hidden />
            </span>
            Agent Studio
          </div>
          <div className="label-text mb-2 px-1">YOUR WORKSPACE</div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm font-medium"
            aria-label="Merchant: Nira Botanics (only demo merchant)"
            title="Only one demo merchant available"
          >
            <Store className="size-4 text-muted-foreground" aria-hidden />
            <span className="flex-1 truncate">Nira Botanics</span>
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
          <div className="label-text mb-1 flex items-center gap-1.5 px-1">
            <Bot className="size-3.5" aria-hidden />
            Agent Studio
          </div>
          <div className="mb-1 rounded-md px-2 py-1.5 text-sm font-semibold">Retention Agent</div>
          <ul className="grid grid-cols-2 gap-1 lg:ml-3 lg:block lg:space-y-0.5 lg:border-l lg:pl-2">
            {NAV.map((n) => {
              const active = path === n.to;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "hover:bg-muted"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <n.icon className="size-4 shrink-0" aria-hidden />
                    <span className="min-w-0">{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="label-text mt-5 mb-1 flex items-center gap-1.5 px-1">
            <FlaskConical className="size-3.5" aria-hidden />
            Channels
          </div>
          <ul className="ml-3 space-y-0.5 border-l pl-2 text-sm text-muted-foreground">
            <li className="flex items-center justify-between px-2 py-1.5">
              WhatsApp <Pill>Demo</Pill>
            </li>
            <li className="flex items-center justify-between px-2 py-1.5">
              Voice <Pill>Demo</Pill>
            </li>
          </ul>
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          <Button variant="tertiary" size="small" onClick={() => setAboutOpen(true)}>
            About this prototype
          </Button>
          <AppModal
            isOpen={aboutOpen}
            onDismiss={() => setAboutOpen(false)}
            title="About this prototype"
            subtitle="Independent buildathon concept for the Razorpay AI PM Build Challenge (Track 2: Recover and Grow with AI)."
            size="medium"
          >
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Retention Agent is a proposed extension for Razorpay Agent Studio. It is not an
                official Razorpay product, is not endorsed by Razorpay, and has no live integration.
              </p>
              <p>
                All merchants, customers and orders are generated. Recommendations come from a
                rule-based model standing in for the AI; messages, deliveries and payments are
                simulated. No external services are contacted.
              </p>
              <p>
                Built using Razorpay's open-source Blade components and theme tokens, with custom
                application layouts. Fonts are self-hosted copies of Blade's TASA Orbiter and Inter
                files (SIL OFL 1.1).
              </p>
            </div>
          </AppModal>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-header sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b bg-card px-3 py-2 xl:flex xl:px-6">
          <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-muted-foreground">
            <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
              <li>Agent Studio</li>
              <li aria-hidden>/</li>
              <li>
                <Link to="/" className="hover:text-foreground">
                  Retention Agent
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-foreground" aria-current="page">
                {CRUMB[path] ?? ""}
              </li>
            </ol>
          </nav>
          <div className="header-controls flex min-w-0 flex-wrap items-center gap-2 xl:ml-auto">
            <EvaluatorTour
              onFreshCampaign={() =>
                update((s) => ({ ...s, studio: { ...s.studio, activeId: null } }))
              }
            />
            <span
              role="status"
              title="Nira Botanics is a sample store. Orders, customers and Razorpay scores are generated, and no real customer is messaged or charged."
              className="flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1.5 text-xs text-muted-foreground"
            >
              <FlaskConical className="size-3.5 shrink-0" aria-hidden />
              Demo store · sample data
            </span>
            <Button
              variant="secondary"
              size="small"
              icon={RefreshIcon}
              onClick={() => setResetOpen(true)}
            >
              Reset demo
            </Button>
            <AppModal
              isOpen={resetOpen}
              onDismiss={() => setResetOpen(false)}
              title="Reset the demo?"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setResetOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      reset();
                      setResetOpen(false);
                      setDone(true);
                      setTimeout(() => setDone(false), 2500);
                    }}
                  >
                    Reset demo
                  </Button>
                </>
              }
            >
              <p className="text-sm leading-relaxed">
                Restores the identical seeded dataset and clears all saved campaigns, templates and
                demo events. All exclusions, approvals, sends and simulated outcomes (
                {state.campaign.events.length} events) are cleared.
              </p>
            </AppModal>
            {done && (
              <span role="status" className="text-xs text-success">
                Demo reset
              </span>
            )}
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-[1280px] flex-1 px-3 py-6 sm:px-7 sm:py-8">
          {children}
        </main>
        <footer className="border-t px-6 py-2 text-xs text-muted-foreground">
          Retention Agent — Proposed extension for Razorpay Agent Studio · Independent buildathon
          concept · Not an official Razorpay product
        </footer>
      </div>
    </div>
  );
}
