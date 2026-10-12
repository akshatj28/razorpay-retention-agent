import { CheckIcon } from "@razorpay/blade/components";
import { AppModal } from "./AppModal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isStoreConnected } from "@/retention/onboarding";
import {
  Button,
  ArrowRightIcon,
  ArrowLeftIcon,
  CompassIcon,
  CloseIcon,
} from "@razorpay/blade/components";

const WELCOME_KEY = "retention-evaluator-welcome-v2";
export const TOUR_STOPS = [
  {
    route: "/setup",
    target: "setup",
    title: "Start where the merchant's data already lives.",
    rationale:
      "Shopify knows what each customer bought. Razorpay knows what was actually paid, refunded or returned to origin. Connecting both, read-only, is the only setup, and nothing is sent without the merchant's approval.",
    try: "Click Connect demo store for a one-click setup, or step through the four screens a merchant would see.",
  },
  {
    route: "/",
    target: "opportunity",
    title: "A decision to make, not a dashboard to read.",
    rationale:
      "Each morning the agent turns six months of orders into three campaigns: reorder reminders, second orders and win-back. The merchant gets a plan to approve, not a report to interpret.",
    try: "Compare the three cards: customers to message, the control group, and how many get no discount at all.",
  },
  {
    route: "/campaigns",
    target: "studio",
    // Show the suggested campaigns even when a saved campaign is open.
    freshCampaign: true,
    title: "One decision per customer.",
    rationale:
      "For every customer the agent picks the product, whether a discount is worth it, and how they should pay. Full-price buyers get a plain reminder, coupon users get a code only if it adds profit, and COD buyers with RTO risk are asked to pay online. Customers are ranked by expected extra profit before the customer limit.",
    try: "Click Review campaign on Reorder reminder and open Products & discounts. Switch between No discount and With a discount code, and read the Why column.",
  },
  {
    route: "/campaigns",
    target: "studio",
    title: "The merchant stays in control.",
    rationale:
      "Maximum discount, minimum profit per order, discount budget and spend limit are rules, not model output. Approval locks the exact customers, discounts and messages. Any edit unlocks it, and every customer is checked again just before sending.",
    try: "In the campaign you just opened, set Maximum discount to 0% on Products & discounts, then open Budget & approval and watch the plan change.",
  },
  {
    route: "/insights",
    target: "benchmark",
    title: "Measured against having no retention tool.",
    rationale:
      "The product is judged the way a merchant would judge it: the same 2,500 customers with no retention tool, with a manual 20% sale, and with Retention Agent. How customers actually behave is simulated separately from what the agent predicts, so the agent is allowed to lose.",
    try: "Drag How much messages influence buying to 0×. Messages stop causing orders, and the agent drops below having no tool.",
  },
  {
    route: "/database",
    target: "database",
    title: "Trace every decision to its inputs.",
    rationale:
      "30,000 orders, refunds and Razorpay RTO scores sit behind every recommendation, with source and date. Missing or old scores fall back to the store's own history instead of guessing.",
    try: "Switch the table to razorpay_signals and search a customer ID from the campaign.",
  },
  {
    route: "/campaigns",
    target: "studio",
    title: "Measure what the campaign caused.",
    rationale:
      "The control group gets no message. Results count only orders that were delivered and paid, after RTO and refunds, and compare them with the control group. The fee waits until that is settled. Sales credited to a message are shown, but never treated as proof.",
    try: "Approve and start the campaign, send messages until it finishes, then click Settle deliveries and payments on the Results tab.",
  },
] as const;

export function EvaluatorTour({ onFreshCampaign }: { onFreshCampaign?: () => void } = {}) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [welcome, setWelcome] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const card = useRef<HTMLElement>(null);
  const restart = useRef<HTMLButtonElement>(null);
  const stop = step === null ? null : TOUR_STOPS[step];

  useEffect(() => {
    let first = true;
    try {
      first = localStorage.getItem(WELCOME_KEY) !== "seen";
    } catch {
      /* Treat a browser without storage as a first visit. */
    }
    setWelcome(first);
    // A first visit opens on store setup, where a merchant would begin.
    if (first && path === "/" && !isStoreConnected()) void navigate({ to: "/setup" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissWelcome() {
    setWelcome(false);
    try {
      localStorage.setItem(WELCOME_KEY, "seen");
    } catch {
      /* Browsing without storage still works. */
    }
  }
  function start() {
    dismissWelcome();
    setStep(0);
  }
  function exit() {
    setStep(null);
    setRect(null);
    restart.current?.focus();
  }

  useEffect(() => {
    if (step === null) return;
    const target = TOUR_STOPS[step]!;
    if ("freshCampaign" in target) onFreshCampaign?.();
    void navigate({ to: target.route });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, navigate]);

  useEffect(() => {
    if (!stop || path !== stop.route) {
      setRect(null);
      return;
    }
    let frame = 0;
    let scrolled = false;
    function measure() {
      const target = document.querySelector<HTMLElement>(`[data-tour="${stop!.target}"]`);
      if (!target) {
        setRect(null);
        return;
      }
      if (!scrolled) {
        scrolled = true;
        target.scrollIntoView({ block: "start", behavior: "instant" });
        card.current?.focus({ preventScroll: true });
      }
      const bounds = target.getBoundingClientRect();
      setRect({
        top: bounds.top - 5,
        left: bounds.left - 5,
        width: bounds.width + 10,
        height: bounds.height + 10,
      });
    }
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.querySelector("main") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [stop, path]);

  useEffect(() => {
    if (step === null) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") exit();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [step]);

  return (
    <>
      <Button ref={restart} variant="secondary" size="small" onClick={start} icon={CompassIcon}>
        Guided tour
      </Button>
      <AppModal
        isOpen={welcome}
        onDismiss={dismissWelcome}
        size="medium"
        title="Win the second order without discounting everyone."
        subtitle="Retention Agent is a proposed Razorpay Agent Studio agent for D2C brands. It reads a store's orders and payments, then decides who to message, with what, and how they should pay."
      >
        <ol className="grid gap-2 sm:grid-cols-2">
          {[
            ["Connect", "Shopify orders and Razorpay payments, read-only"],
            ["Review", "Today's campaigns: who to message, which product, discount or not"],
            ["Approve", "Set limits and approve. Nothing is sent before this"],
            ["Measure", "Extra profit compared with customers who got no message"],
          ].map(([title, text], i) => (
            <li key={title} className="rounded-lg border p-3">
              <span className="text-xs font-semibold text-primary">
                {i + 1} · {title}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <p className="rounded-lg bg-surface p-3 text-sm leading-relaxed">
          <Compass className="mr-1.5 inline size-4 align-[-3px] text-primary" aria-hidden />
          Reviewing this build? The guided tour takes about two minutes. At each step it explains
          the choice I made and why.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={start} icon={ArrowRightIcon} iconPosition="right">
            Take the guided tour
          </Button>
          <Button variant="tertiary" onClick={dismissWelcome}>
            Explore on my own
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Nira Botanics is a sample store with generated data. No real customer is messaged or
          charged. Restart the tour any time from the top bar.
        </p>
      </AppModal>
      {stop && step !== null && (
        <>
          {rect && (
            <div
              aria-hidden
              className="tour-spotlight pointer-events-none fixed z-20 rounded-xl border-2 border-primary"
              style={rect}
            />
          )}
          <section
            ref={card}
            tabIndex={-1}
            role="region"
            aria-label="Guided tour"
            aria-live="polite"
            className="tour-card fixed right-4 bottom-4 z-40 w-[390px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Compass className="size-4" aria-hidden />
                Why it works this way · {step + 1} / {TOUR_STOPS.length}
              </span>
              <Button
                variant="tertiary"
                size="small"
                accessibilityLabel="Exit guided tour"
                onClick={exit}
                icon={CloseIcon}
              ></Button>
            </div>
            <div className="mt-2 flex gap-1" aria-hidden>
              {TOUR_STOPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <h2 className="mt-4 font-heading text-xl leading-tight font-semibold">{stop.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stop.rationale}</p>
            <div className="mt-3 rounded-xl bg-primary-subtle p-3 text-xs leading-relaxed">
              <b className="text-primary">Try it yourself</b>
              <p className="mt-1">{stop.try}</p>
            </div>
            {path !== stop.route && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => void navigate({ to: stop.route })}
              >
                Return to this stop
              </Button>
            )}
            {step === TOUR_STOPS.length - 1 && (
              <details className="mt-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">
                  How this demo works
                </summary>
                <p className="mt-2 leading-relaxed">
                  Seeded fictional orders → derived customer features → deterministic decision model
                  → policy gates → merchant approval → simulated outcomes. A future AI model would
                  replace the estimates, not the hard controls. The earlier offer-maths labs remain
                  at /cohort, /workbench and /review as an appendix. No live Razorpay, Vulcan,
                  messaging or payment integration.
                </p>
              </details>
            )}
            <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
              <Button
                variant="tertiary"
                size="small"
                isDisabled={step === 0}
                onClick={() => setStep(step - 1)}
                icon={ArrowLeftIcon}
              >
                Back
              </Button>
              <Button
                size="small"
                icon={step === TOUR_STOPS.length - 1 ? CheckIcon : ArrowRightIcon}
                iconPosition="right"
                onClick={() => (step === TOUR_STOPS.length - 1 ? exit() : setStep(step + 1))}
              >
                {step === TOUR_STOPS.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Interact with the product behind this card · Esc to exit
            </p>
          </section>
        </>
      )}
    </>
  );
}
