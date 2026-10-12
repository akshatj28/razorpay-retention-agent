import { CheckIcon } from "@razorpay/blade/components";
import { AppModal } from "./AppModal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  ArrowRightIcon,
  ArrowLeftIcon,
  CompassIcon,
  CloseIcon,
} from "@razorpay/blade/components";

const WELCOME_KEY = "retention-evaluator-welcome-v1";
export const TOUR_STOPS = [
  {
    route: "/",
    target: "opportunity",
    title: "Start with a decision, not a dashboard.",
    rationale:
      "Each day the agent turns six months of orders into three campaigns to review: replenishment, second purchase and win-back. The merchant gets a plan to approve, not a report to interpret.",
    try: "Compare the three proposals: contacts, controls, and how many customers get a reminder without any discount.",
  },
  {
    route: "/campaigns",
    target: "studio",
    title: "One decision per customer.",
    rationale:
      "For every customer the agent picks the product, whether a discount is worth it, and how they should pay. Full-price buyers get a plain reminder; coupon users get an offer only if it adds contribution; medium- or high-risk COD buyers get a prepaid nudge. Customers are ranked by expected extra contribution before the audience cap.",
    try: "Click Review proposal on Replenishment and open Products & offers. Switch between Reminder, no discount and With an offer, and read the Evidence column.",
  },
  {
    route: "/campaigns",
    target: "studio",
    title: "The merchant stays in control.",
    rationale:
      "Discount cap, contribution floor, liability cap and spend limit are rules, not model output. Approval freezes the exact audience, offers and messages; any edit invalidates it, and eligibility is rechecked before every send.",
    try: "Set Maximum discount to 0% on Products & offers, then open Economics & approval and watch the plan change.",
  },
  {
    route: "/insights",
    target: "benchmark",
    title: "The agent is allowed to lose.",
    rationale:
      "The same 2,500 customers face four strategies in a simulated world whose hidden demand is separate from the agent's estimates. Both intelligence rows run Campaign Studio's own decision logic, with and without the Razorpay risk signal.",
    try: "Drag intervention effectiveness to 0×. Outreach stops causing purchases, and the agent falls below doing nothing.",
  },
  {
    route: "/database",
    target: "database",
    title: "Trace every decision to its inputs.",
    rationale:
      "30,000 orders, refunds and simulated Razorpay signals sit behind every recommendation, with source and freshness. Missing or stale signals fall back to store history instead of guessing.",
    try: "Switch the table to razorpay_signals and search a customer ID from the campaign.",
  },
  {
    route: "/campaigns",
    target: "studio",
    title: "Close the loop without overclaiming.",
    rationale:
      "Controls get no message. Results count collected orders after RTO and refunds, compare treatment with control, and the success share waits for reconciliation. Attributed orders are never presented as proof of uplift.",
    try: "Approve and start the campaign, send batches until it completes, then reconcile on the Outcomes tab.",
  },
] as const;

export function EvaluatorTour() {
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
    try {
      setWelcome(localStorage.getItem(WELCOME_KEY) !== "seen");
    } catch {
      setWelcome(true);
    }
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
    if (step !== null) void navigate({ to: TOUR_STOPS[step]!.route });
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
        Evaluator walkthrough
      </Button>
      <AppModal
        isOpen={welcome}
        onDismiss={dismissWelcome}
        title="See the product. Understand the decisions."
        subtitle="A six-stop walkthrough for the PM evaluating this build: why I chose the workflow, where the merchant stays in control, and what this demo actually proves."
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary">
          <Compass className="size-6" aria-hidden />
        </div>
        <p className="rounded-lg bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
          These are merchant-facing screens. Shoppers receive the message and purchase experience.
          All data, recommendations and execution are simulated.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={start} icon={ArrowRightIcon} iconPosition="right">
            Start guided demo{" "}
          </Button>
          <Button variant="tertiary" onClick={dismissWelcome}>
            Explore independently
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Optional · Restart anytime from the header · Never auto-approves or sends
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
            aria-label="Evaluator walkthrough"
            aria-live="polite"
            className="tour-card fixed right-4 bottom-4 z-40 w-[390px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Compass className="size-4" aria-hidden />
                PM lens · {step + 1} / {TOUR_STOPS.length}
              </span>
              <Button
                variant="tertiary"
                size="small"
                accessibilityLabel="Exit evaluator walkthrough"
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
