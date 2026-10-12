import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WELCOME_KEY = "retention-evaluator-welcome-v1";
export const TOUR_STOPS = [
  { route: "/", target: "opportunity", title: "Start with a decision, not a dashboard.", rationale: "I chose replenishment as one complete retention journey. The agent proposes an audience and offer mix; the merchant gets an action to review, not just a report.", try: "Inspect the proposed contacts and offer mix. These are demo recommendations, not learned predictions." },
  { route: "/cohort", target: "cohort", title: "Choosing whom not to contact matters.", rationale: "Purchase history suggests who is due. Consent, refunds, stock and contact frequency constrain the audience. Missing history goes to merchant review rather than invented certainty.", try: "Switch to Excluded or Needs review. Open a customer to inspect the evidence." },
  { route: "/workbench", target: "decisions", title: "Three merchant decisions, one workspace.", rationale: "I structured the campaign around who, what and incentive. Recommendations are a starting point: the merchant can change timing, offers and economic constraints before approving.", try: "Try a 5% discount cap, then restore 20%. Notice how the recommendation changes." },
  { route: "/workbench", target: "economics", title: "Protect contribution, not just conversion.", rationale: "A larger discount need not be the best action. Offer comparisons expose the economics and policy limits. Here, purchase probabilities are explicit per-product assumptions—not customer-level intelligence or causal evidence.", try: "Open Calculation & assumptions. Compare the coffee fixture at 0%, 10% and 20%." },
  { route: "/review", target: "approval", title: "The merchant owns the launch.", rationale: "Approval is tied to the exact plan. Edits invalidate it, hard blocks cannot be overridden, and eligibility is checked again before sending. The agent cannot silently bypass these controls.", try: "Review the policy checks. You can approve, launch and send a demo batch; nothing is sent to real shoppers." },
  { route: "/review", target: "outcomes", title: "Close the loop without overclaiming.", rationale: "Outcome tracking connects actions to purchases and opt-outs. A holdout supports future evaluation, but attributed orders are not proof of incremental growth. This small simulated demo does not estimate uplift or retrain a model.", try: "After launch, send a batch and record a purchase. Try Pause or replay an outcome to inspect control and duplicate protection." },
] as const;

export function EvaluatorTour() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [welcome, setWelcome] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const card = useRef<HTMLElement>(null);
  const restart = useRef<HTMLButtonElement>(null);
  const stop = step === null ? null : TOUR_STOPS[step];

  useEffect(() => {
    try { setWelcome(localStorage.getItem(WELCOME_KEY) !== "seen"); }
    catch { setWelcome(true); }
  }, []);

  function dismissWelcome() {
    setWelcome(false);
    try { localStorage.setItem(WELCOME_KEY, "seen"); } catch { /* Browsing without storage still works. */ }
  }
  function start() { dismissWelcome(); setStep(0); }
  function exit() { setStep(null); setRect(null); restart.current?.focus(); }

  useEffect(() => {
    if (step !== null) void navigate({ to: TOUR_STOPS[step]!.route });
  }, [step, navigate]);

  useEffect(() => {
    if (!stop || path !== stop.route) { setRect(null); return; }
    let frame = 0;
    let scrolled = false;
    function measure() {
      const target = document.querySelector<HTMLElement>(`[data-tour="${stop!.target}"]`);
      if (!target) { setRect(null); return; }
      if (!scrolled) {
        scrolled = true;
        target.scrollIntoView({ block: "start", behavior: "instant" });
        card.current?.focus({ preventScroll: true });
      }
      const bounds = target.getBoundingClientRect();
      setRect({ top: bounds.top - 5, left: bounds.left - 5, width: bounds.width + 10, height: bounds.height + 10 });
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open"] });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("resize", schedule); window.removeEventListener("scroll", schedule, true); };
  }, [stop, path]);

  useEffect(() => {
    if (step === null) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") exit(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [step]);

  return <>
    <Button ref={restart} variant="outline" size="sm" onClick={start}><Compass className="size-4" aria-hidden /><span>Evaluator walkthrough</span></Button>
    <Dialog open={welcome} onOpenChange={(open) => { if (!open) dismissWelcome(); }}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl bg-card sm:max-w-lg">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Compass className="size-6" aria-hidden /></div>
        <DialogHeader><DialogTitle className="font-heading text-2xl leading-tight">See the product.<br />Understand the decisions.</DialogTitle><DialogDescription className="pt-2 leading-relaxed">A six-stop walkthrough for the PM evaluating this build: why I chose the workflow, where the merchant stays in control, and what this demo actually proves.</DialogDescription></DialogHeader>
        <p className="rounded-lg bg-surface p-3 text-xs leading-relaxed text-muted-foreground">These are merchant-facing screens. Shoppers receive the message and purchase experience. All data, recommendations and execution are simulated.</p>
        <div className="flex flex-wrap gap-2"><Button onClick={start}>Start guided demo <ArrowRight className="size-4" aria-hidden /></Button><Button variant="ghost" onClick={dismissWelcome}>Explore independently</Button></div>
        <p className="text-xs text-muted-foreground">Optional · Restart anytime from the header · Never auto-approves or sends</p>
      </DialogContent>
    </Dialog>
    {stop && step !== null && <>
      {rect && <div aria-hidden className="tour-spotlight pointer-events-none fixed z-20 rounded-xl border-2 border-primary" style={rect} />}
      <section ref={card} tabIndex={-1} role="region" aria-label="Evaluator walkthrough" aria-live="polite" className="tour-card fixed right-4 bottom-4 z-40 w-[390px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-primary"><Compass className="size-4" aria-hidden />PM lens · {step + 1} / {TOUR_STOPS.length}</span><Button variant="ghost" size="icon" className="size-7" aria-label="Exit evaluator walkthrough" onClick={exit}><X className="size-4" aria-hidden /></Button></div>
        <div className="mt-2 flex gap-1" aria-hidden>{TOUR_STOPS.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
        <h2 className="mt-4 font-heading text-xl leading-tight font-semibold">{stop.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stop.rationale}</p>
        <div className="mt-3 rounded-xl bg-primary-subtle p-3 text-xs leading-relaxed"><b className="text-primary">Try it yourself</b><p className="mt-1">{stop.try}</p></div>
        {path !== stop.route && <Button variant="outline" size="sm" className="mt-3" onClick={() => void navigate({ to: stop.route })}>Return to this stop</Button>}
        {step === TOUR_STOPS.length - 1 && <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer font-medium text-foreground">How this demo works</summary><p className="mt-2 leading-relaxed">Seeded fictional orders → derived customer features → deterministic recommendation adapter → policy gates → merchant approval → simulated outcomes. A future AI adapter would replace recommendations, not the hard controls. One playbook works end-to-end; cross-sell and win-back are concept previews. No live Razorpay, Vulcan, messaging or payment integration.</p></details>}
        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3"><Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft className="size-4" aria-hidden />Back</Button><Button size="sm" onClick={() => step === TOUR_STOPS.length - 1 ? exit() : setStep(step + 1)}>{step === TOUR_STOPS.length - 1 ? <>Finish <Check className="size-4" aria-hidden /></> : <>Next <ArrowRight className="size-4" aria-hidden /></>}</Button></div>
        <p className="mt-2 text-[11px] text-muted-foreground">Interact with the product behind this card · Esc to exit</p>
      </section>
    </>}
  </>;
}
