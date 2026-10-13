# AI build log

This log follows the brief's four questions: which AI tools were used, what for, how they sped up or improved the work, and where I made the key decisions myself. The dated, file-level history is in [../BUILD_LOG.md](../BUILD_LOG.md).

## Timeline

| Dates (2026) | Phase | Output |
|---|---|---|
| 28 Sep – 7 Oct | Research | Landscape reports, Magic Checkout merchant list, journey and competitor map |
| 7 – 8 Oct | Narrowing and decision | Decision record, idea scoring, storyboard, working-backwards press release, build brief |
| 10 Oct | First prototype | Lovable build from the written brief; feedback deck |
| 12 Oct | Rebuild | Synthetic merchant (30,000 orders), campaign studio, Razorpay Blade UI, impact simulation, tests |
| 12 – 13 Oct | Merchant-language pass | Plain-language screens, guided tour, connections, copy review |

## 1. Tools and what each was used for

| Tool | Used for |
|---|---|
| **Claude (Claude Code, desktop app)** | Research synthesis into one decision record; challenging the idea against the brief; structuring the storyboard and press release with PM skills; writing the Lovable build brief; most of the code from 12 Oct (decision logic, data generator, tests, Blade migration, copy passes); reviewing the build against the judging criteria |
| **PM skills for Claude** (`storyboard`, `press-release`, by Dean Peters) | Six-frame merchant storyboard and an Amazon-style working-backwards press release, used to test whether the story holds before building |
| **AI deep-research reports** | Two long-form landscape studies: AI revenue recovery at payment platforms, and the feasibility of AI-personalised reorders, including the regulatory picture (DPDP, TRAI, WhatsApp pricing) |
| **Lovable** | First clickable version (10 Oct) from the written brief, connected to this GitHub repository |
| **AI image generation** | The one photographic background behind the WhatsApp creative ([CREATIVE_ASSETS.md](CREATIVE_ASSETS.md)). Products and prices are composited by code, never generated |
| **Headless browser automation (Playwright)** | Checking every screen at desktop and phone widths: no overflow, no console errors, no external network calls, and the approve → send → reconcile flow |

## 2. How AI sped up or improved the work

- **Breadth of research in days, not weeks.** Eight journey stages, 15+ competitors and around 30 Magic Checkout case studies were mapped in about a week. That made the "who already serves this stage" filter possible. Without it, we would have picked a crowded stage such as abandoned carts.
- **A working product instead of a clickable mock.** Real decision logic, a 30,000-order merchant with joins that reconcile, 25 automated tests and a counterfactual simulation were built over about four build days. That's the difference between *saying* "no discount for customers who'd buy anyway" and *showing* which customers, and why.
- **A synthetic merchant judges can inspect.** The same seeded generator drives the app, the CSV files and a SQLite database, so every number in the UI can be traced to rows.
- **Fast review loops.** Each iteration ended with typecheck, tests, a production build and a browser check, run by the agent. Rejecting a version cost minutes, not a day.
- **Testing the story before building.** The storyboard and press release exposed weak points early, such as an unvalidated persona and the "isn't this just BiteSpeed?" question, while they were still cheap to fix.

## 3. Decisions I made myself

AI generated options and evidence. These calls were mine:

| Decision | What I chose | What I rejected, and why |
|---|---|---|
| Where in the journey | **After the first order** | Abandoned cart and failed payments are bigger pools, but Razorpay and 5+ vendors already act there |
| What the product is | **A decision agent; messaging is a channel** | A BiteSpeed-style CRM. BiteSpeed has been a Razorpay partner since June 2026, so competing with a partner is the wrong move |
| The AI claim | **"Does this customer need a discount at all?"** | Predicting reorder timing, which Klaviyo already does |
| Proof | **Extra profit against a control group, after discounts, RTO and refunds** | Attributed revenue, which every vendor reports and which takes credit for organic orders |
| COD → prepaid | **Folded in as a payment decision** inside the agent | A standalone product, because RTO Shield and COD confirmation already ship |
| Network data | **Used only for payment/delivery risk** | Cross-merchant discount targeting: consent risk under DPDP and a poor fit with Razorpay's processor role |
| Merchant control | **Nothing is sent without approval; approval freezes the audience** | Autonomous sending, even though it demos more impressively |
| Pitch framing | **Lead with discount waste and the finance question** | Leading with "repeat rate", because founders name acquisition cost and discounts first |
| Demo merchant | **One coherent skincare and haircare brand** | A mixed catalog from the first version, which made reorder rhythms unconvincing |
| Honesty | **Label every simulated input; v1 response estimates are transparent priors** | Calling the formula a trained model |

## 4. Where I corrected the AI

AI output was reviewed against the brief and the code. Some fixes that came out of that review:

- Audiences were being capped **by customer ID**. They're now scored first and capped by expected extra earnings, with control groups drawn from the same ranked audience.
- A WhatsApp template leaked an **internal label** ("Prepaid nudge; COD rechecked at checkout") into the shopper's message. It was replaced with plain sentences.
- The **fee baseline** in the impact simulation didn't match the in-app control group. Both now use "extra profit over no campaign outreach".
- A browser reload exposed a **saved-work race** (React StrictMode could overwrite drafts). It was fixed, and a regression test was added.
- Screens were written in **engineering language** (incremental contribution, ITT). We rewrote them in words merchants use in Shopify, the Razorpay dashboard and WhatsApp tools.
- The first version mentioned **BiteSpeed as the sending channel**. It was removed so the product doesn't depend on, or appear to endorse, a specific partner.

## 5. What AI did not do

- **It didn't replace talking to merchants.** No growth manager has been interviewed yet. The persona is a proto-persona, and the interview plan is in [RESEARCH.md](RESEARCH.md#6-open-questions-and-how-wed-validate).
- **It didn't produce real impact numbers.** Every result in the app is simulated from stated assumptions.
