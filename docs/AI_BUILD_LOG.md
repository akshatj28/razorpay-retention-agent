# Retention Agent AI Build Log

Razorpay x ISB AI PM Build Challenge | Track 2 | 13 October 2026

[Try the prototype](https://smart-retention-razorpay.lovable.app/)

## How I used AI

I used AI throughout discovery, market research, product definition, implementation and review. The most consequential intervention happened before coding: I challenged an early recommendation to pursue B2B invoice-blocker resolution and redirected the research towards Razorpay's merchant segments, visible product priorities and commercial fit.

The project became a retention agent for D2C merchants through that process of questioning and revision. I asked AI to generate alternatives, research them, explain its assumptions and critique the proposed experience. I made the decisions about which audience to serve, what outcome to optimise and what to build. AI then helped implement and test those decisions.

The prompt excerpts below come from the build conversations. They are selected excerpts, with the original wording retained. The explanations describe how the discussion affected the final product; they do not imply that every early idea was implemented.

## Tools and models

| Tool | Research models | Execution models or role |
| --- | --- | --- |
| Codex | GPT 6.1 Sol | GPT 5.6 for implementation and iteration |
| Claude Code | Opus 5.5 | Sonnet 5 for implementation and iteration |
| Lovable | Underlying model not recorded | Initial scaffold, Git-connected preview and hosting |
| ImageGen | Underlying model not recorded | Botanical background for WhatsApp communication |

I used proprietary models for research and execution. Research reports were brought back into the discussion for comparison and source checks. I requested focused research prompts and, where report quality was uneven, another research pass before choosing a direction. I am not claiming a fixed automated multi-agent setup; this was an iterative workflow that I directed across tools and research runs.

The prototype itself does not call a live language, image or voice model at runtime. ElevenLabs voice is a proposed integration, not a service used to execute calls in the demo.

## Recorded build timeline

| Dates in 2026 | Phase | Recorded output |
| --- | --- | --- |
| 28 September to 7 October | Market research | Landscape studies, Magic Checkout merchant examples and a journey and competitor map |
| 7 to 8 October | Narrowing and definition | Decision record, candidate comparison, storyboard, working-backwards press release and build brief |
| 10 October | Initial prototype | Lovable scaffold generated from the brief and subsequent review |
| 12 October | Campaign studio and data | Coherent synthetic merchant, order database, decision logic, Blade interface, comparison simulator and tests |
| 12 to 13 October | Merchant experience | Plain-language copy, guided tour, connection and store flows, review and fixes |

These dates come from the project's recorded timeline. They describe the sequence of work, not a measured claim that AI saved a particular number of days.

## 1 Start with the merchant opportunity

I first asked the AI to consider the range of customers Razorpay serves and their pain points before committing to a solution:

> But you would think about various customer that Razorpay serves, where things can be built - like mutiple pain points and then you build for the most impactful?

We explored four candidates: profit-aware abandoned-cart recovery, blocked B2B collections, contextual subscription recovery and post-purchase repeat-order decisioning. The B2B candidate concerned locating acceptance evidence and resolving documentation or invoice/PO mismatches for service firms, rather than generic invoice reminders.

The AI recommended that B2B direction because it offered a clear role for interpreting unstructured documents and a demonstrable workflow. I challenged the selection criteria:

> Can we start with finding how's the current razorpay customer share is split - like how much D2C business, how much SaaS Business, how much educational business and how these share are growing?

> I feel "Why AI rather than a fixed rule?" This shouldn't be our core criteria

This changed the order of reasoning. A problem should be selected for merchant importance, economic stakes and Razorpay's ability to reach and serve that audience. AI suitability should then be tested as part of the solution. A compelling AI demonstration alone was insufficient justification for the choice.

The AI explicitly acknowledged that it had given AI suitability too much weight and recommended B2B prematurely. This is the principal example of an AI recommendation I did not accept during brainstorming.

## 2 Use public evidence to form a strategic hypothesis

We had no internal Razorpay customer or revenue data. When the research could not establish a reliable segment split, I directed it towards observable evidence rather than letting that uncertainty stop the analysis:

> What I was thinking is that we can also take a look at Razorpay's website and offer to get a sense of what their more lucrative or prominent segment is, because they must be building a lot for them. That could be one.

> It is not about inventing numbers.

The research reviewed the website, product pages, launch portfolio, Agent Studio, merchant case studies and checkout offerings. We looked for where Razorpay was visibly investing across the customer journey, which merchants those products addressed, and how a new proposal might complement that direction.

The merchant research also compiled concrete Magic Checkout brands across categories. It separated Razorpay's own case studies, merchant reviews on the Shopify App Store and third-party mentions. Published case-study metrics were treated as vendor-reported signals, not independently verified lift. This grounded the audience discussion in identifiable merchants without extrapolating a representative customer-share estimate from a visible sample.

Razorpay's [Sprint 2026 portfolio](https://razorpay.com/sprint/26) gives D2C its own product track alongside other strategic areas. [Magic Checkout](https://razorpay.com/magic-checkout/) foregrounds D2C growth, conversion and COD controls. Those signals supported a hypothesis that consumer commerce was a strategically relevant audience for this challenge. They did not establish its share of Razorpay revenue, its profitability or a company-wide ranking of personas.

That distinction mattered: I wanted a defensible outsider strategy, using reasonable assumptions backed by evidence. We did not need to invent a market-share percentage to compare strategic fit. B2B remained a plausible opportunity, but its fit with the reachable merchant base was less established in our research.

## 3 Make the market research answer decision questions

I asked for focused research on the candidate problems rather than a broad report that mixed opportunity sizing, architecture and solution design:

> What I can do is start deep research, but you have to give me four prompts for each of them. Ensure that the prompts themselves are concise.

I also assigned the AI a review role after the research was returned:

> You don't need to do it yourself, you can vet, check for inconsistency or doubt and build over it, but v1 I will get you - you just give me the prompt.

The resulting research instructions asked about the merchant's present workflow, evidence of pain, existing capabilities, available data, the strongest reason not to build and a cheap validation test. An excerpt from the repeat-order research prompt was:

> Could cohort-level experimentation improve decisions without claiming individual counterfactual prediction?

> Return an evidence table, a testable problem hypothesis, the strongest reason not to build, and the cheapest validation test.

The process was: define a narrow question, obtain a report, compare it with the other candidates, inspect important sources, challenge overstatements and revise the hypothesis. When newer reports were stronger than the initial B2B and cart-recovery studies, I requested that the first two be researched again before the final comparison.

Several conclusions were corrected in this review. Published recovery results could not be transferred across geographies and merchant types without checking scope. Existing customer purchases were not proof that a discount was unnecessary. An undocumented competitor capability could not be called absent. Faster collection of an existing invoice was not automatically new revenue. These checks stopped a persuasive research narrative from becoming unsupported product claims.

## 4 Challenge the competitor and partnership framing

I asked for a landscape of both cart recovery and repeat-purchase tools in India, including how crowded the spaces were. I also challenged a broad example suggesting abandoned carts were routinely discounted even when the issue was payment failure. The research needed to establish actual workflows before treating that behaviour as a market fact.

I then asked the AI to investigate partnerships and their commercial logic:

> Look for other such partnerships and go a level down to understand why that partnership could exist in the very first place, because they're fighting for the same segment of merchants.

The discussion examined Razorpay's native capabilities alongside tools such as BiteSpeed, Klaviyo, LimeChat, GoKwik and Relo. It considered engagement, checkout, payments, risk, returns and campaign measurement as related jobs, rather than assuming that all companies targeting D2C merchants solved the same problem.

The AI initially treated partner coverage as a reason to avoid building overlapping functionality. I disagreed:

> I don't think that existing partner capabilities should drive our decision in any way, just inform in terms of what the market is demanding and where we lag in current state.

I also challenged the claim that established competitor features were merely inspiration:

> It is some sort of signal for us, not just inspiration.

This revised the framework. Competitor investment and adoption are demand signals with different strengths; they do not prove the value of every individual feature. Partnership overlap should inform the current baseline, integration choices and differentiation. It should not automatically veto an opportunity to improve Razorpay's native experience.

We consequently focused the proposal on the decision and outcome: which customer to contact, what to recommend, whether an incentive is worthwhile, how payment risk affects economics and how to measure additional profit. We avoided claiming that retention, predicted reorder timing or WhatsApp campaigns were new categories.

## 5 Choose a focused persona and journey

The decision record compared subscription merchants, large enterprises, small long-tail merchants, mid-size D2C merchants and the end shopper. We considered merchant need, available signals, differentiation, access and enough transaction history to investigate impact.

A mid-size Shopify D2C brand offered a coherent starting hypothesis: product-level purchase history, repeat-purchase potential and payment/delivery economics could support an actionable retention workflow. The growth or retention manager became the primary user; the shopper was the recipient of the campaign. This was a product choice informed by public research, not a validated declaration of Razorpay's single highest-priority persona.

We mapped the journey from discovery and checkout through delivery, returns, use and reorder. Razorpay already publicly showcases cart recovery, COD confirmation and post-purchase feedback in [Agent Studio](https://razorpay.com/agent-studio/). We chose the period after the first purchase as a focused extension to investigate, rather than simply reproducing an existing recovery agent.

I also challenged narrowing the entire product to one category:

> Also, why are we narrowing to body care consumable shops, but not taking a very high level, like a broader solution for offering retention and retention stack sort of stuff?

The resolution was to keep the merchant experience configurable while demonstrating it through a specific consumables brand. A coherent example made product decisions easier to inspect without pretending that the same timing logic would fit every category. The final prototype supports replenishment, second purchase and win-back; a full CRM remains outside scope.

### Test the product story before coding

The earlier planning used the `storyboard` and `press-release` methods from Dean Peters' Product Manager Skills. AI helped turn the decision record into a six-frame merchant story and a working-backwards press release. These exposed a useful question: could a retention manager explain to finance what a campaign actually earned after discounts and unsuccessful deliveries?

The storyboard moved from the merchant's current campaign and finance review to an editable recommendation, approval and a measured result. It also helped define what a short demo should show. The fictional persona and illustrative result were explicitly marked as assumptions, with interview quotes left as placeholders. I did not treat that narrative as customer evidence or carry its earlier result figures into the final demo as measured outcomes.

This exercise sharpened the benefit being demonstrated: an inspectable decision and a finance-relevant outcome. It also exposed the gaps that a compelling story could hide, particularly merchant validation and model learning.

## 6 Turn the concept into realistic data and an editable workflow

The early demo used a generic everyday-essentials store with a small, tidy synthetic history. I asked for a consistent personal-care brand and a more realistic order model:

> Let's change "everyday essential" to "some cosmetic store" or something like that, and have a consistent product. Take inspiration from Mama Earth so that you have a good variety of products and a good product mix and match.

> Create a database of, say, orders done over the last 6 months, with 5K orders per month as the average.

> it should show individual order, customer ID level, product mix, and all that stuff that Shopify would be doing.

This led to fictional Nira Botanics: 18 product variants, 30,000 orders, 12,000 customers and 41,095 line items. The history includes quantities, discount use, payment and fulfilment states, refunds and COD outcomes. Mamaearth inspired catalog coherence; no Mamaearth customer data or business metrics were used.

The app, CSV exports and SQLite database share one seeded generator. The larger dataset was designed to test the workflow and make evidence inspectable, not to validate an economic result by volume alone.

I asked for both suggested campaigns and a build-your-own path, using familiar retention-platform patterns. The merchant can review the audience, recommended product and offer, edit WhatsApp assets and call branches, then approve, schedule or pause. This expanded the prototype into a campaign studio while keeping one shared decision engine.

## 7 Ask where AI belongs and accept technical corrections

I explicitly asked:

> Also, at what point would the AI be used in this whole workflow to build intelligence?

I explored whether Razorpay's intelligence could inform payment treatment and discount decisions, while asking the AI to challenge my assumptions:

> Again, this is me being the dreamer. You have to keep me realistic and be the voice of logic.

That discussion separated four responsibilities: Shopify history for products and purchase behaviour; permitted Razorpay signals for payment and delivery risk; a retention model for timing and incremental response; and a language model for explanations and communication.

I accepted a technical correction: Vulcan is a payments foundation model, not a text LLM or a database exposing complete cross-merchant shopping histories. Its payment knowledge does not automatically establish a customer's causal response to a discount. Razorpay's [Vulcan explanation](https://razorpay.com/blog/vulcan-how-razorpay-built-a-foundation-model-for-payment-decisions/) describes structured payment representations and task-specific decision layers.

The final demo therefore keeps risk signals and retention estimates separate and explicitly simulated. Missing or stale payment-risk signals use store-history fallback. Production would need entitled signal access, task-specific training and controlled validation; there is no claimed live Vulcan endpoint in this build.

### Make the decision logic inspectable

The README explains the intended decision as comparing the expected contribution from an intervention with the expected contribution without it. I made the prototype's assumptions inspectable so a reviewer could challenge the mechanism rather than accept an unexplained AI score.

The current code evaluates allowed offer levels using the customer's purchase history, a campaign-specific relevance estimate, product contribution and simulated delivery risk. Discount history is smoothed with a 25% prior worth three orders: one discounted purchase is weak evidence. The prototype also considers the operator's expected share less delivery costs. A reminder without a discount or no outreach can therefore be selected.

An earlier review found that offer probabilities were set per product and ignored the customer's own discount history. That weakened the central claim: different buyers of the same product could receive the same recommendation regardless of their histories. The later implementation uses customer-level features and explains the timing, offer and payment decision. This improves the demonstration, but a customer's historical coupon use still does not establish their causal response to an offer.

The four possibilities discussed during design—would buy anyway, responds to an offer, does not respond, or is discouraged by outreach—are a causal framework to investigate. They are not observed facts about individual customers. A production model would need experiments and calibration, and would have to outperform an appropriate rules baseline on merchant outcomes.

## 8 Change the commercial model and comparison baseline

I proposed outcome pricing and challenged the earlier treatment of operating costs:

> Also, how do you think we sell it on an outcome basis? In that case, the call and everything is a function of our cost, not theirs.

This changed the economics. The illustrative model gives the operator 25% of positive aggregate incremental contribution after campaign losses offset wins. The operator bears AI, creative, WhatsApp and call costs. The merchant's contribution calculation includes discounts, product costs, fulfilment, payment costs, returns and RTO before the success fee.

The AI helped pressure-test why a percentage of attributed sales would be insufficient: some purchases would happen anyway, while discounted or uncollected orders could make the merchant worse off. Calls must also pass operator-economics and permission checks. The rate is an assumption for the demo, not a validated commercial price.

I later corrected the primary comparison to fit the audience being pitched:

> Also, shouldn't you think that, in the measurement of the uplift, it should be compared with the baseline for a merchant who does not have any retention product versus what this retention product would deliver for them?

The Impact page now leads with extra profit versus no retention tool, what the merchant retains after the illustrative fee, and a secondary comparison with a manual 20% sale. A store-data-only run isolates the simulated contribution of payment-risk enrichment.

For a real pilot, the control must reflect the merchant's actual business-as-usual: a merchant without software may still send manual messages. The synthetic no-outreach baseline is transparent, but it does not replace an agreed real-world experiment.

### Separate forecasts from synthetic outcomes

The benchmark compares the same 2,500 customers under no retention tool, a manual 20% sale, a store-data-only agent and an agent with simulated payment-risk enrichment. Its purchase behaviour is simulated separately from the recommendation formulas, so the comparison does not merely repeat the forecast as the answer.

The sensitivity control includes zero messaging influence. Under that assumption, outreach does not increase buying, although assumed payment treatment can still affect delivery economics. This lets the reviewer examine when the proposed strategy loses value. The simulation's separate outcome mechanism is a useful stress test, not evidence that the assumptions are correct or that real merchants will see the displayed gain.

Campaign results also distinguish orders placed, orders delivered and paid, returns/refunds and estimated extra contribution. Pending or refunded orders should not be accepted as settled wins. New purchases update eligibility and suppress follow-ups; learning response parameters from the experiment remains future work.

## 9 Preserve merchant work while recommendations change

I raised a state-management question before implementation:

> I think we would have to also think about the states where the merchant makes something of their own and that stays in a templateized format (let's say, as in a draft format) so that they can come and work again.

The resulting design distinguishes saved drafts, reusable templates, refreshed opportunities and approved campaigns. Recommendations can refresh as new transactions arrive, while merchant copy and offers remain intact. Approval freezes the campaign version and assignments; material edits require reapproval. Pre-send checks can suppress newly ineligible customers without silently expanding the audience.

This was a product decision about trust and control, with implementation consequences for persistence, versioning and experiment reservations.

## 10 Direct the build and review the generated implementation

I kept brainstorming and execution as separate steps, asking to align on the approach before building. Once the decisions were settled, I explicitly requested the plan, implementation and database updates through Git.

Lovable provided the initial scaffold and hosting. Claude Code and Codex helped customise the app directly through the connected repository. We retained Lovable hosting for a usable reviewer link, while GitHub held the code and records. Changes were additive rather than rewriting published history.

I requested Razorpay's actual design language:

> Check for that as well so that it feels like it is designed for Razorpay.

The first AI build chose Blade-inspired styling instead of actual Blade components. That was significantly improved: the revised interface uses Blade buttons, fields, tables, tabs, modals, drawers and notifications while preserving the decision logic. Desktop and mobile checks followed the migration.

Behind the screens, AI-assisted implementation kept decision functions separate from the interface. Screens read a shared derived state rather than inventing headline totals independently. The synthetic history is regenerated from a fixed seed; only merchant work and simulated events are persisted in the browser. That makes reset reproducible and limits the chance that screens disagree about a customer or campaign. These choices were part of making the demo reviewable, not an assertion of production infrastructure readiness.

I also requested an evaluator tour that explains why the product was built as it was, and later a screen-by-screen copy audit:

> whatever we are showing on the screen should be easy to read as well as self-explanatory in nature.

The tour and copy review made the merchant journey and product reasoning easier to inspect. Reviewer feedback was used to identify further gaps, not presented as objective proof of product-market fit.

## 11 Generate WhatsApp imagery with verified commercial facts

I wanted AI-assisted communication throughout the experience, including editable WhatsApp assets and call flows. ImageGen produced one botanical background, stored locally and reused by the app. The saved prompt included:

> Keep the central 60 percent calm and empty to receive verified product cards and personalized offer text composited by the application. No product packaging, no people, no medical claims, no words, no logos, no prices, no coupons, no watermark. This is a background asset rather than a screenshot or UI mockup.

The app composes that background with catalog products, sizes and approved prices. This preserves commercial facts and avoids generating a new image for every recipient. Live per-customer generation, WhatsApp delivery and voice calls remain disconnected.

## What AI did and what I owned

| Work | AI contribution | My contribution |
| --- | --- | --- |
| Opportunity selection | Generated and compared candidate problems | Challenged the B2B recommendation and changed the selection lens |
| Market research | Drafted focused prompts, synthesised reports and checked sources | Requested segment, website, competitor and partnership research; decided how to interpret signals |
| Product definition | Proposed workflows, alternatives and technical constraints | Chose persona, scope, campaign controls and acceptance criteria |
| Economics | Developed contribution calculations and comparison logic | Proposed outcome pricing, operator-funded delivery and the intended customer baseline |
| Data and code | Generated and revised implementation, data exports and tests | Specified realistic records and reviewed fidelity to the merchant job |
| Design and communication | Built screens, tour and generated background | Requested Razorpay design alignment, editable assets and plain merchant language |
| Verification | Ran recorded tests and walkthroughs, diagnosed failures and implemented fixes | Challenged mismatches and decided which limitations to disclose |

AI expanded the number of alternatives I could examine and helped turn decisions into working behaviour. I have not measured a time-saving multiple. Its output still required product judgment, source checking and verification.

## Verification and known limitations

The implementation records document concrete failures and corrections:

- A reload race could overwrite saved drafts. Hydration-before-write was implemented and a remount regression test added.
- Campaign selection was corrected to rank customers by expected additional contribution before applying an audience cap, rather than selecting by customer ID.
- Approved experiments reserve both treatment and control customers across campaigns. Treatment denominators retain skipped and no-outreach assignments.
- The comparison labels, fee baseline and exports were aligned. Late refunds adjust simulated outcomes once; losses offset wins before the illustrative fee.
- A tour-replay issue with an existing campaign was repaired so a fresh editable example could be opened without deleting saved work.
- A WhatsApp preview exposed an internal payment-treatment label to shoppers. The message was corrected to use ordinary customer-facing language, while retaining the internal decision separately.
- Merchant copy was revised to explain extra profit, control groups and delivered-and-paid orders in familiar terms. The implementation no longer depends on BiteSpeed as a named sending channel; optional voice requires its own permission.

The latest recorded verification on 13 October reports 25 passing tests across seven files, TypeScript checks, a production build and browser checks of the store flow and Connections. Earlier verification covers approval, invalidation, sending, pause, reset, responsive screens and CSV/SQLite joins, totals and integrity. These are project-recorded results, not a fresh code test run performed for this write-up.

The main remaining limits are substantive:

- **Merchant validation:** public research informed the hypothesis; we have not validated the persona or pain through merchant interviews.
- **Learned intelligence:** response estimates are deterministic assumptions. Outcomes update history and eligibility, but automated recalibration from experiments is not implemented.
- **Integrations:** Shopify/Razorpay connections, payment-risk enrichment, runtime drafting, messaging, calls and collection are simulated. No real customer is contacted or charged.
- **Outcome proof:** synthetic comparisons do not establish causal commercial uplift. A pilot needs randomised assignment, an agreed baseline, uncertainty assessment, reconciliation and a delivery/return window.
- **Operational readiness:** workflow persistence is local to the browser. A live product needs durable storage, entitled data access, channel permissions, reliable event handling and billing rules.
- **Strength of the Razorpay advantage:** payment-risk enrichment adds only modest value in some synthetic scenarios. Its incremental benefit needs testing against the same product using store data alone. Dashboard distribution and reliable collection/refund information may matter as much as the risk score; neither advantage is quantified here.

My next step would be 3-5 merchant interviews to test the workflow and current workaround, followed by a controlled pilot measuring incremental collected contribution per eligible customer and what the merchant retains after fees.

## Build records

The narrative draws on the research and product conversations, the decision record, and the repository README and implementation records. The relevant decisions, prompt excerpts, verification results and limitations are included directly above. Supporting records are:

- [Product overview and reviewer walkthrough](https://github.com/akshatj28/razorpay-retention-agent/blob/main/README.md)
- [Research and candidate narrowing](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/RESEARCH.md)
- [Dated implementation and verification history](https://github.com/akshatj28/razorpay-retention-agent/blob/main/BUILD_LOG.md)
- [Product decisions and integration boundaries](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/PRODUCT_DECISIONS.md)
- [Historical interface revisions](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/history/UI_REFRESH_NOTES.md)
- [Image prompt and provenance](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/CREATIVE_ASSETS.md)
- [Synthetic data dictionary](https://github.com/akshatj28/razorpay-retention-agent/blob/main/data/nira/README.md)
