# Retention Agent AI Build Log

Razorpay x ISB AI PM Build Challenge | Track 2 | 13 October 2026

[Working prototype](https://smart-retention-razorpay.lovable.app/) | [Product overview](../README.md)

## 1 How I used AI and directed the work

I used AI to investigate merchant opportunities, compare public evidence, develop a product specification, implement the prototype and review its behaviour. My most consequential intervention preceded coding: I challenged an early recommendation to build B2B invoice-blocker resolution and asked AI to investigate Razorpay's merchant segments, public product investments and commercial fit before choosing a problem.

That process led to Retention Agent: a working concept for D2C growth and retention managers. I directed the persona, scope, outcome metric, campaign controls and commercial assumptions. Claude Code and Codex assisted research, implementation and verification; Lovable supplied the initial scaffold and hosting; ImageGen produced a reusable WhatsApp background. I conducted the practitioner interview myself.

This log records how prompts and review changed the work. It distinguishes my instructions and decisions, AI-generated proposals and code, and capabilities planned for production. AI used to build the prototype is separate from AI proposed inside the product: runtime predictions, message generation and voice are simulated here, with no live predictive model connected.

The original prompt excerpts are retained in Section 8. They are selected excerpts rather than complete transcripts. My prompts were often conversational and relied on the working context. Their value came from changing the research question, requesting evidence, specifying acceptance criteria and challenging the result, rather than from one self-contained instruction producing the whole product. I have not measured a time-saving multiple.


**Read by section:** [Tools and workflow](#2-tools-models-and-working-setup) | [Research direction](#3-research-and-product-decisions-i-directed) | [Outputs I challenged](#4-ai-outputs-i-rejected-corrected-or-significantly-improved) | [Prototype and AI boundaries](#5-from-product-decisions-to-the-working-prototype) | [Ownership](#6-what-ai-did-and-what-i-owned) | [Verification and limits](#7-verification-limitations-and-next-tests) | [Prompt excerpts](#8-selected-prompts-and-supporting-records)

## 2 Tools, models and working setup

| Tool | Research models | Execution models or role |
| --- | --- | --- |
| Codex | GPT 6.1 Sol | GPT 5.6 for implementation and iteration |
| Claude Code | Opus 5.5 | Sonnet 5 for implementation and iteration |
| Lovable | Underlying model not recorded | Initial scaffold, Git-connected preview and hosting |
| ImageGen | Underlying model not recorded | Botanical background for WhatsApp communication |

The model names above are the versions I reported using for this project; this log does not independently establish every session's exact model configuration. Underlying Lovable and ImageGen versions were not recorded. I used proprietary models for research and execution. Research reports were brought back into the discussion for comparison and source checks. I requested focused research prompts and, where report quality was uneven, another research pass before choosing a direction. I am not claiming a fixed automated multi-agent setup; this was an iterative workflow that I directed across tools and research runs.

The prototype itself does not call a live language, image or voice model at runtime. ElevenLabs voice is a proposed integration, not a service used to execute calls in the demo.

### Working sequence and handoffs

| Stage | What I supplied or decided | What AI helped produce | How I reviewed it |
| --- | --- | --- | --- |
| Opportunity framing | Merchant segments, economic importance and Razorpay fit as selection questions | Candidate problems and comparison criteria | Challenged the premature B2B recommendation |
| Focused research | Separate questions for each candidate and requests for another pass when quality differed | Research prompts, reports, source summaries and landscape maps | Checked key sources, compared scope and challenged unsupported claims |
| Product definition | Persona, campaign decisions, exclusions, controls and outcome pricing | Decision record, storyboard, working-backwards press release and build brief | Aligned on the approach before execution |
| Initial build | Approved brief and request for Razorpay design alignment | Lovable scaffold and hosted preview | Inspected fidelity to the intended workflow |
| Git-based iteration | Requests for realistic data, editable campaigns, persistent drafts, contribution accounting and plain language | Claude Code/Codex implementation, exports, fixes and recorded checks | Reviewed screens, assumptions and state transitions; requested corrections |
| Submission review | My interview account, the original survey PDF and the final communication requirements | Source checks and revised explanations of the product and build process | Distinguished verified evidence, hypotheses and simulated results |

Research outputs were brought back into the conversation for comparison. The approved specification then guided implementation in the Git-connected repository; revised previews and checks informed the next requests. This describes my actual iterative working arrangement, not an autonomous research-and-build pipeline.

### Recorded timeline

| Dates in 2026 | Phase | Recorded output |
| --- | --- | --- |
| 28 September to 7 October | Market research | Landscape studies, Magic Checkout merchant examples and a journey and competitor map |
| 7 to 8 October | Narrowing and definition | Decision record, candidate comparison, storyboard, working-backwards press release and build brief |
| 10 October | Initial prototype | Lovable scaffold generated from the brief and subsequent review |
| 12 October | Campaign studio and data | Coherent synthetic merchant, order database, decision logic, Blade interface, comparison simulator and tests |
| 12 to 13 October | Merchant experience | Plain-language copy, guided tour, connection and store flows, review and fixes |

These dates come from the project's recorded timeline. They describe the sequence of work, not a measured claim that AI saved a particular number of days.

## 3 Research and product decisions I directed

### Start with the merchant opportunity

Prompt references: P01-P03 in Section 8.

I first asked the AI to consider the range of customers Razorpay serves and their pain points before committing to a solution. See the referenced prompt excerpts.

I evaluated four AI-generated candidates: profit-aware abandoned-cart recovery, blocked B2B collections, contextual subscription recovery and post-purchase repeat-order decisioning. The B2B candidate concerned locating acceptance evidence and resolving documentation or invoice/PO mismatches for service firms, rather than generic invoice reminders.

The AI recommended that B2B direction because it offered a clear role for interpreting unstructured documents and a demonstrable workflow. I challenged the selection criteria (P02-P03).

This changed the order of reasoning. A problem should be selected for merchant importance, economic stakes and Razorpay's ability to reach and serve that audience. AI suitability should then be tested as part of the solution. A compelling AI demonstration alone was insufficient justification for the choice.

The AI explicitly acknowledged that it had given AI suitability too much weight and recommended B2B prematurely. This is the principal example of an AI recommendation I did not accept during brainstorming.

### Form a strategic hypothesis from observable evidence

Prompt references: P04-P05 in Section 8.

I had no internal Razorpay customer or revenue data. When the research could not establish a reliable segment split, I directed it towards observable evidence rather than letting that uncertainty stop the analysis (P04-P05).

The research reviewed the website, product pages, launch portfolio, Agent Studio, merchant case studies and checkout offerings. I asked AI to examine where Razorpay was visibly investing across the customer journey, which merchants those products addressed, and how a new proposal might complement that direction.

The merchant research also compiled concrete Magic Checkout brands across categories. It separated Razorpay's own case studies, merchant reviews on the Shopify App Store and third-party mentions. Published case-study metrics were treated as vendor-reported signals, not independently verified lift. This grounded the audience discussion in identifiable merchants without extrapolating a representative customer-share estimate from a visible sample.

Razorpay's [Sprint 2026 portfolio](https://razorpay.com/sprint/26) gives D2C its own product track alongside other strategic areas. [Magic Checkout](https://razorpay.com/magic-checkout/) foregrounds D2C growth, conversion and COD controls. Those signals supported a hypothesis that consumer commerce was a strategically relevant audience for this challenge. They did not establish its share of Razorpay revenue, its profitability or a company-wide ranking of personas.

That distinction mattered: I wanted a defensible outsider strategy, using reasonable assumptions backed by evidence. I did not need an invented market-share percentage to compare strategic fit. B2B remained a plausible opportunity, but its fit with the reachable merchant base was less established in our research.

### Make research answer decision questions

Prompt references: P06-P09 in Section 8.

I asked for focused research on the candidate problems rather than a broad report that mixed opportunity sizing, architecture and solution design (P06).

I also assigned the AI a review role after the research was returned (P07).

The resulting research instructions asked about the merchant's present workflow, evidence of pain, existing capabilities, available data, the strongest reason not to build and a cheap validation test. Excerpts from the AI-assisted repeat-order research prompt are preserved as P08-P09.

The process was: define a narrow question, obtain a report, compare it with the other candidates, inspect important sources, challenge overstatements and revise the hypothesis. When newer reports were stronger than the initial B2B and cart-recovery studies, I requested that the first two be researched again before the final comparison.

Several conclusions were corrected in this review. Published recovery results could not be transferred across geographies and merchant types without checking scope. Existing customer purchases were not proof that a discount was unnecessary. An undocumented competitor capability could not be called absent. Faster collection of an existing invoice was not automatically new revenue. These checks stopped a persuasive research narrative from becoming unsupported product claims.

### Interpret competitors and partnerships

Prompt references: P10-P12 in Section 8.

I asked for a landscape of both cart recovery and repeat-purchase tools in India, including how crowded the spaces were. I also challenged a broad example suggesting abandoned carts were routinely discounted even when the issue was payment failure. The research needed to establish actual workflows before treating that behaviour as a market fact.

I then asked the AI to investigate partnerships and their commercial logic (P10).

The discussion examined Razorpay's native capabilities alongside tools such as BiteSpeed, Klaviyo, LimeChat, GoKwik and Relo. It considered engagement, checkout, payments, risk, returns and campaign measurement as related jobs, rather than assuming that all companies targeting D2C merchants solved the same problem.

The AI initially treated partner coverage as a reason to avoid building overlapping functionality. I disagreed and changed that framing (P11-P12).

I also challenged the claim that established competitor features were merely inspiration. See the referenced prompt excerpts.

This revised the framework. Competitor investment and adoption are demand signals with different strengths; they do not prove the value of every individual feature. Partnership overlap should inform the current baseline, integration choices and differentiation. It should not automatically veto an opportunity to improve Razorpay's native experience.

I consequently focused the proposal on the decision and outcome: which customer to contact, what to recommend, whether an incentive is worthwhile, how payment risk affects economics and how to measure additional profit. I did not position retention, predicted reorder timing or WhatsApp campaigns as new categories.

### Choose a persona and journey, then test the story

Prompt references: P13 in Section 8.

The decision record compared subscription merchants, large enterprises, small long-tail merchants, mid-size D2C merchants and the end shopper. I used merchant need, available signals, differentiation, access and enough transaction history to investigate impact as decision criteria.

A mid-size Shopify D2C brand offered a coherent starting hypothesis: product-level purchase history, repeat-purchase potential and payment/delivery economics could support an actionable retention workflow. The growth or retention manager became the primary user; the shopper was the recipient of the campaign. This was a product choice informed by public research, not a validated declaration of Razorpay's single highest-priority persona.

I used AI-assisted research to map the journey from discovery and checkout through delivery, returns, use and reorder. Razorpay already publicly showcases cart recovery, COD confirmation and post-purchase feedback in [Agent Studio](https://razorpay.com/agent-studio/). I chose the period after the first purchase as a focused extension to investigate, rather than simply reproducing an existing recovery agent.

I also challenged narrowing the entire product to one category. See the referenced prompt excerpts.

The resolution was to keep the merchant experience configurable while demonstrating it through a specific consumables brand. A coherent example made product decisions easier to inspect without pretending that the same timing logic would fit every category. The final prototype supports replenishment, second purchase and win-back; a full CRM remains outside scope.

#### Test the product story before coding

The earlier planning used the `storyboard` and `press-release` methods from Dean Peters' Product Manager Skills. AI helped turn the decision record into a six-frame merchant story and a working-backwards press release. These exposed a useful question: could a retention manager explain to finance what a campaign actually earned after discounts and unsuccessful deliveries?

The storyboard moved from the merchant's current campaign and finance review to an editable recommendation, approval and a measured result. It also helped define what a short demo should show. The fictional persona and illustrative result were explicitly marked as assumptions, with interview quotes left as placeholders. I did not treat that narrative as customer evidence or carry its earlier result figures into the final demo as measured outcomes.

This exercise sharpened the benefit being demonstrated: an inspectable decision and a finance-relevant outcome. It also exposed the gaps that a compelling story could hide, particularly merchant validation and model learning.

### Add direct interview evidence and verify the original survey

I interviewed Vartika Mittal of NatHabit, whose experience includes D2C retention and growth. She described the effort involved in defining cohorts and preparing campaigns with internal tools, and the difficulty of producing customer-level intelligence. I supplied that account during final drafting. AI helped organise the insight; it did not conduct the interview or invent a transcript. This is a paraphrase, not a quotation, endorsement or measured time-saving result. It supports the workflow problem while broader prevalence and product impact remain open.

**Original-source check during final drafting:** I supplied the DSGCP × Meta × ViralMint playbook PDF after its download was unavailable to the agent. AI visually inspected the relevant survey pages and checked the claims against the charts: 70% cite CAC/ROAS inconsistency, 55% under-invest in CRM/retention, and 54.3% fall in the 10–30% repeat-purchase band. This led to two wording corrections: acquisition efficiency, rather than rising CAC alone, leads the growth-blocker chart; the repeat-rate chart does not establish a 90-day measurement window. AI also flagged the inconsistency between that growth-blocker chart and its adjacent prose instead of presenting them as one statistic. These survey findings support the problem framing, not the prototype's impact. Page references and limitations are recorded in [the research evidence](RESEARCH.md#practitioner-interview-and-published-evidence).

## 4 AI outputs I rejected, corrected or significantly improved

These examples show where my direction changed the output. Implementation fixes discovered through AI-assisted review are identified as such; I do not claim that I personally diagnosed every bug or wrote the resulting code.

| AI proposal or initial output | My intervention and why it mattered | Resulting change and verification boundary |
| --- | --- | --- |
| B2B invoice-blocker resolution was favoured for its clear AI role | I asked for Razorpay's merchant mix, visible investments and economically important problems; AI suitability could not lead the selection. P02-P05 | AI acknowledged the premature recommendation. Public research supported D2C as a starting hypothesis, without inventing customer-share figures. This is my principal rejected brainstorming output |
| Existing partner coverage was treated as a reason to avoid overlapping functionality | I asked what partnerships and competitor investment revealed about demand and the current baseline. P10-P12 | The research considered native improvement and differentiation instead of using partner coverage as a veto. Retention was treated as an existing market |
| Early offer estimates were product-level and could ignore the customer's own history | I required customer-level records and asked where intelligence would enter the workflow. Review exposed the weak connection between history and offers. P15-P18 | The revised formulas use customer-level features and explain timing, offer and payment treatment. Coupon history remains an illustrative input, not causal proof of discount response |
| The initial scaffold used Blade-inspired styling | I requested closer Razorpay design fidelity and reviewed the generated interface. P22 | AI-assisted implementation adopted actual Blade components; recorded desktop and mobile checks followed. The design correction did not itself validate the decision model |
| Saved drafts could be overwritten on reload; approved work also needed stable state | I specified persistent merchant-owned drafts and templates rather than disposable recommendations. P21. AI-assisted review identified the reload race | Hydration-before-write and a remount regression test addressed persistence. Revision-bound approval and experiment reservations preserve campaign control |
| Shopper communication exposed an internal payment-treatment label | I requested screen-by-screen language that merchants and customers could understand. P23 | AI-assisted review corrected the message while retaining the internal decision separately; communication was checked against the customer-facing preview |

I also accepted corrections to my own hypotheses. In particular, payment-risk intelligence cannot establish causal discount sensitivity, and Vulcan does not expose a complete cross-merchant shopping history. Asking AI to be the “voice of logic” (P18) gave it an explicit role in challenging my assumptions, while the product decisions remained mine.

## 5 From product decisions to the working prototype

### Where intelligence belongs

The frozen product note describes three proposed model outputs: product rankings, purchase-timing estimates and purchase-response estimates with and without permitted offers. Catalog information, customer history and patterns among comparable buyers would support those estimates. Merchant costs and permitted payment/delivery-risk signals would then inform the action and its expected additional contribution.

| Responsibility | Proposed live product | What this prototype demonstrates |
| --- | --- | --- |
| Facts and integration inputs | Connected orders, catalog, inventory, consent, payments, refunds and courier outcomes; costs supplied or confirmed by the merchant | One seeded synthetic history and simulated signals; no live connections |
| Product and timing intelligence | Models rank relevant products and estimate purchase windows from customer and comparable-buyer patterns | Rule-based product selection, historical intervals and illustrative defaults |
| Offer-response intelligence | Task-specific models estimate response under permitted actions, calibrated with randomised evidence | Transparent customer-level formulas and stated priors, not trained causal estimates |
| Economic decision and controls | Compare permitted actions using estimates and costs; enforce consent, stock, discount, margin and frequency limits explicitly | Simulated offer evaluation, no-outreach decisions, approvals and pre-send checks |
| Communication | Product-grounded drafts and permitted voice follow-ups, editable before approval | Simulated text/call adapters; one real ImageGen background with deterministic product/price composition |
| Learning and measurement | Reconcile outcomes and update calibrated models from controlled experiments | Outcome history and eligibility update; automated model recalibration is not implemented |

The learned estimates are planned capability. Neither building with AI nor producing a customer-level number demonstrates that the runtime is using a trained model. The implementation and the limitations below keep that boundary explicit.

### Specify realistic data and an editable campaign workflow

Prompt references: P14-P16 in Section 8.

The early demo used a generic everyday-essentials store with a small, tidy synthetic history. I asked for a consistent personal-care brand and a more realistic order model (P14-P16).

This led to fictional Nira Botanics: 18 product variants, 30,000 orders, 12,000 customers and 41,095 line items. The history includes quantities, discount use, payment and fulfilment states, refunds and COD outcomes. Mamaearth inspired catalog coherence; no Mamaearth customer data or business metrics were used.

The app, CSV exports and SQLite database share one seeded generator. The larger dataset was designed to test the workflow and make evidence inspectable, not to validate an economic result by volume alone.

I asked for both suggested campaigns and a build-your-own path, using familiar retention-platform patterns. The merchant can review the audience, recommended product and offer, edit WhatsApp assets and call branches, then approve, schedule or pause. This expanded the prototype into a campaign studio while keeping one shared decision engine.

### Ask where AI belongs and make its assumptions inspectable

Prompt references: P17-P18 in Section 8.

I explicitly asked. See the referenced prompt excerpts.

I explored whether Razorpay's intelligence could inform payment treatment and discount decisions, while asking the AI to challenge my assumptions (P18).

That discussion separated four responsibilities: Shopify history for products and purchase behaviour; permitted Razorpay signals for payment and delivery risk; a retention model for timing and incremental response; and a language model for explanations and communication.

I accepted a technical correction: Vulcan is a payments foundation model, not a text LLM or a database exposing complete cross-merchant shopping histories. Its payment knowledge does not automatically establish a customer's causal response to a discount. Razorpay's [Vulcan explanation](https://razorpay.com/blog/vulcan-how-razorpay-built-a-foundation-model-for-payment-decisions/) describes structured payment representations and task-specific decision layers.

The final demo therefore keeps risk signals and retention estimates separate and explicitly simulated. Missing or stale payment-risk signals use store-history fallback. Production would need entitled signal access, task-specific training and controlled validation; there is no claimed live Vulcan endpoint in this build.

#### Make the decision logic inspectable

The README explains the intended decision as comparing the expected contribution from an intervention with the expected contribution without it. I made the prototype's assumptions inspectable so a reviewer could challenge the mechanism rather than accept an unexplained AI score.

The current code evaluates allowed offer levels using the customer's purchase history, a campaign-specific relevance estimate, product contribution and simulated delivery risk. Discount history is smoothed with a 25% prior worth three orders: one discounted purchase is weak evidence. The prototype also considers the operator's expected share less communication and AI costs. A reminder without a discount or no outreach can therefore be selected.

An earlier review found that offer probabilities were set per product and ignored the customer's own discount history. That weakened the central claim: different buyers of the same product could receive the same recommendation regardless of their histories. The later implementation uses customer-level features and explains the timing, offer and payment decision. This improves the demonstration, but a customer's historical coupon use still does not establish their causal response to an offer.

The four possibilities discussed during design—would buy anyway, responds to an offer, does not respond, or is discouraged by outreach—are a causal framework to investigate. They are not observed facts about individual customers. A production model would need experiments and calibration, and would have to outperform an appropriate rules baseline on merchant outcomes.

### Set economics and the comparison baseline

Prompt references: P19-P20 in Section 8.

I proposed outcome pricing and challenged the earlier treatment of operating costs (P19).

This changed the economics. The illustrative model gives the operator 25% of positive aggregate incremental contribution after campaign losses offset wins. The operator bears AI, creative, WhatsApp and call costs. The merchant's contribution calculation includes discounts, product costs, fulfilment, payment costs, returns and RTO before the success fee.

The AI helped pressure-test why a percentage of attributed sales would be insufficient: some purchases would happen anyway, while discounted or uncollected orders could make the merchant worse off. Calls must also pass operator-economics and permission checks. The rate is an assumption for the demo, not a validated commercial price.

I later corrected the primary comparison to fit the audience being pitched (P20).

The Impact page now leads with extra profit versus no retention tool, what the merchant retains after the illustrative fee, and a secondary comparison with a manual 20% sale. A store-data-only run isolates the simulated contribution of payment-risk enrichment.

For a real pilot, the control must reflect the merchant's actual business-as-usual: a merchant without software may still send manual messages. The synthetic no-outreach baseline is transparent, but it does not replace an agreed real-world experiment.

#### Separate forecasts from synthetic outcomes

The benchmark compares the same 2,500 customers under no retention tool, a manual 20% sale, a store-data-only agent and an agent with simulated payment-risk enrichment. Its purchase behaviour is simulated separately from the recommendation formulas, so the comparison does not merely repeat the forecast as the answer.

The sensitivity control includes zero messaging influence. Under that assumption, outreach does not increase buying, although assumed payment treatment can still affect delivery economics. This lets the reviewer examine when the proposed strategy loses value. The simulation's separate outcome mechanism is a useful stress test, not evidence that the assumptions are correct or that real merchants will see the displayed gain.

Campaign results also distinguish orders placed, orders delivered and paid, returns/refunds and estimated extra contribution. Pending or refunded orders should not be accepted as settled wins. New purchases update eligibility and suppress follow-ups; learning response parameters from the experiment remains future work.

### Preserve merchant work while recommendations change

Prompt references: P21 in Section 8.

I raised a state-management question before implementation (P21).

The resulting design distinguishes saved drafts, reusable templates, refreshed opportunities and approved campaigns. Recommendations can refresh as new transactions arrive, while merchant copy and offers remain intact. Approval freezes the campaign version and assignments; material edits require reapproval. Pre-send checks can suppress newly ineligible customers without silently expanding the audience.

This was a product decision about trust and control, with implementation consequences for persistence, versioning and experiment reservations.

### Direct implementation and review the interface

Prompt references: P22-P23 in Section 8.

I kept brainstorming and execution as separate steps, asking to align on the approach before building. Once the decisions were settled, I explicitly requested the plan, implementation and database updates through Git.

Lovable provided the initial scaffold and hosting. Claude Code and Codex helped customise the app directly through the connected repository. I retained Lovable hosting for a usable reviewer link, while GitHub held the code and records. Changes were additive rather than rewriting published history.

I requested Razorpay's actual design language (P22).

The first AI build chose Blade-inspired styling instead of actual Blade components. That was significantly improved: the revised interface uses Blade buttons, fields, tables, tabs, modals, drawers and notifications while preserving the decision logic. Desktop and mobile checks followed the migration.

Behind the screens, AI-assisted implementation kept decision functions separate from the interface. Screens read a shared derived state rather than inventing headline totals independently. The synthetic history is regenerated from a fixed seed; only merchant work and simulated events are persisted in the browser. That makes reset reproducible and limits the chance that screens disagree about a customer or campaign. These choices were part of making the demo reviewable, not an assertion of production infrastructure readiness.

I also requested an evaluator tour that explains why the product was built as it was, and later a screen-by-screen copy audit (P23).

The tour and copy review made the merchant journey and product reasoning easier to inspect. Reviewer feedback was used to identify further gaps, not presented as objective proof of product-market fit.

### Generate imagery without inventing commercial facts

Prompt references: P24 in Section 8.

I wanted AI-assisted communication throughout the experience, including editable WhatsApp assets and call flows. ImageGen produced one botanical background, stored locally and reused by the app. The saved prompt is reproduced as P24 in Section 8.

The app composes that background with catalog products, sizes and approved prices. This preserves commercial facts and avoids generating a new image for every recipient. Live per-customer generation, WhatsApp delivery and voice calls remain disconnected.

## 6 What AI did and what I owned

| Work | AI contribution | My contribution |
| --- | --- | --- |
| Opportunity selection | Generated and compared candidate problems | Challenged the B2B recommendation and changed the selection lens |
| Market research | Drafted focused prompts, synthesised reports and checked sources | Requested segment, website, competitor and partnership research; decided how to interpret signals |
| Product definition | Proposed workflows, alternatives and technical constraints | Chose persona, scope, campaign controls and acceptance criteria |
| Practitioner interview | Organised the account and supporting public evidence | Conducted the interview and supplied the practitioner's account; did not treat it as endorsement or measured impact |
| Economics | Developed contribution calculations and comparison logic | Proposed outcome pricing, operator-funded delivery and the intended customer baseline |
| Data and code | Generated and revised implementation, data exports and tests | Specified realistic records and reviewed fidelity to the merchant job |
| Design and communication | Built screens, tour and generated background | Requested Razorpay design alignment, editable assets and plain merchant language |
| Verification | Ran recorded tests and walkthroughs, diagnosed failures and implemented fixes | Challenged mismatches and decided which limitations to disclose |

AI expanded the number of alternatives I could examine and helped turn decisions into working behaviour. I have not measured a time-saving multiple. Its output still required product judgment, source checking and verification.

AI wrote and revised much of the code and generated the data, tests and background asset. My contribution was product direction, evidence interpretation, specification and review; this log does not imply that I manually authored those implementation outputs. Research prompts P08-P09 and the ImageGen prompt P24 were AI-assisted instructions used in the workflow, distinguished from my own conversation excerpts.

## 7 Verification, limitations and next tests

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

- **Merchant validation:** an interview with Vartika Mittal of NatHabit, added during final drafting, supports the cohort/campaign workload and customer-level-intelligence problem. This is a paraphrase of my interview account; broader prevalence, adoption and product impact remain to be tested.
- **Learned intelligence:** response estimates are deterministic assumptions. Outcomes update history and eligibility, but automated recalibration from experiments is not implemented.
- **Integrations:** Shopify/Razorpay connections, payment-risk enrichment, runtime drafting, messaging, calls and collection are simulated. No real customer is contacted or charged.
- **Outcome proof:** synthetic comparisons do not establish causal commercial uplift. A pilot needs randomised assignment, an agreed baseline, uncertainty assessment, reconciliation and a delivery/return window.
- **Operational readiness:** workflow persistence is local to the browser. A live product needs durable storage, entitled data access, channel permissions, reliable event handling and billing rules.
- **Razorpay strategy:** distribution beyond existing Razorpay merchants and an incentive to move processing; adoption and conversion need validation. Optional risk enrichment is a small extra. The product value comes from joined records and collected-profit measurement.

My next step would be additional merchant workflow interviews and a controlled pilot measuring incremental collected contribution per eligible customer, what the merchant retains after fees, and campaign-preparation time. The interview was conducted by me; AI helped organise the insight and verify the supporting public evidence. It did not conduct the interview or generate the practitioner's account.

### Synthetic results and final strategic framing

In a synthetic 90-day scenario with one campaign opportunity per customer across the same 2,500 customers, the agent raised collected earnings by 7.2% before the fee and 5.4% after it over no outreach, under default response assumptions. A blanket 20%-off sale raised them by 0.3%. If messages create no additional orders, the sale loses 4.3% to discounts while the agent loses 0.4%.

The sale is a simple stand-in for broad blanket-discount campaigns; a pilot should compare against a credible rules baseline. Both percentages use the no-outreach control's collected contribution as denominator; 7.2% and 0.3% are before the fee, 5.4% after it. The product joins store, payment and courier data, chooses customer-level outreach and measures profit actually collected against a control group. Razorpay's strategic opportunity is distribution: offer the product to merchants using other payment providers, then give them a reason to move payment processing to Razorpay. Processing conversion is a hypothesis to validate. The delivery-risk signal is a small extra for Razorpay merchants where available. The store-only comparison remains available in the synthetic benchmark; it is not proof of a live payment-risk advantage.

### Publication and evidence boundaries

This Markdown log uses selected work-related prompt excerpts, public sources, attributed interview paraphrases and synthetic prototype data. It does not include raw customer records, complete private conversations, API keys, credentials or internal Razorpay business information. The model names are reported build tools, not proprietary business data. All prototype merchant records and simulated performance results are synthetic; the interview and survey evidence are separately attributed.

For this documentation revision, checks cover preservation of prompt excerpts, consistency with the frozen product note, Markdown links, public accessibility and sensitive-content review. The code test totals above are the dated project records, not new test runs claimed for a documentation-only change.

## 8 Selected prompts and supporting records

These 24 excerpts preserve the wording in the previous build log, including conversational grammar. Labels distinguish my instructions from AI-assisted research prompts and the saved image-generation prompt. I directed the research questions; I do not claim to have written every downstream prompt from scratch. References in Sections 3-5 connect each excerpt to the resulting decisions. The excerpts are curated for this submission rather than a publication of private chat histories.

### P01 Explore merchant problems before choosing a solution

My instruction.

> But you would think about various customer that Razorpay serves, where things can be built - like mutiple pain points and then you build for the most impactful?

### P02 Investigate customer segments before recommending a problem

My instruction.

> Can we start with finding how's the current razorpay customer share is split - like how much D2C business, how much SaaS Business, how much educational business and how these share are growing?

### P03 Change the opportunity-selection criteria

My correction.

> I feel "Why AI rather than a fixed rule?" This shouldn't be our core criteria

### P04 Use observable product investment to investigate strategic fit

My instruction.

> What I was thinking is that we can also take a look at Razorpay's website and offer to get a sense of what their more lucrative or prominent segment is, because they must be building a lot for them. That could be one.

### P05 Do not invent market-share numbers

My constraint.

> It is not about inventing numbers.

### P06 Commission focused research questions for each candidate

My instruction.

> What I can do is start deep research, but you have to give me four prompts for each of them. Ensure that the prompts themselves are concise.

### P07 Assign AI a review role for returned research

My instruction.

> You don't need to do it yourself, you can vet, check for inconsistency or doubt and build over it, but v1 I will get you - you just give me the prompt.

### P08 Test the experiment design without claiming individual counterfactual knowledge

AI-assisted research prompt.

> Could cohort-level experimentation improve decisions without claiming individual counterfactual prediction?

### P09 Require evidence, disconfirming arguments and a cheap test

AI-assisted research prompt.

> Return an evidence table, a testable problem hypothesis, the strongest reason not to build, and the cheapest validation test.

### P10 Investigate the commercial logic of partnerships

My instruction.

> Look for other such partnerships and go a level down to understand why that partnership could exist in the very first place, because they're fighting for the same segment of merchants.

### P11 Treat partner coverage as information rather than a veto

My correction.

> I don't think that existing partner capabilities should drive our decision in any way, just inform in terms of what the market is demanding and where we lag in current state.

### P12 Interpret competitor activity as a demand signal

My correction.

> It is some sort of signal for us, not just inspiration.

### P13 Keep the product configurable while choosing a coherent demo category

My scope challenge.

> Also, why are we narrowing to body care consumable shops, but not taking a very high level, like a broader solution for offering retention and retention stack sort of stuff?

### P14 Replace a generic store with a consistent personal-care catalog

My data brief.

> Let's change "everyday essential" to "some cosmetic store" or something like that, and have a consistent product. Take inspiration from Mama Earth so that you have a good variety of products and a good product mix and match.

### P15 Specify six months of order volume

My data brief.

> Create a database of, say, orders done over the last 6 months, with 5K orders per month as the average.

### P16 Make customer and line-item records inspectable

My data brief.

> it should show individual order, customer ID level, product mix, and all that stuff that Shopify would be doing.

### P17 Identify where AI would create intelligence

My question.

> Also, at what point would the AI be used in this whole workflow to build intelligence?

### P18 Ask AI to challenge my technical assumptions

My review instruction.

> Again, this is me being the dreamer. You have to keep me realistic and be the voice of logic.

### P19 Make operating costs consistent with outcome pricing

My commercial direction.

> Also, how do you think we sell it on an outcome basis? In that case, the call and everything is a function of our cost, not theirs.

### P20 Define the no-retention baseline explicitly

My measurement direction.

> Also, shouldn't you think that, in the measurement of the uplift, it should be compared with the baseline for a merchant who does not have any retention product versus what this retention product would deliver for them?

### P21 Preserve drafts and reusable templates

My workflow requirement.

> I think we would have to also think about the states where the merchant makes something of their own and that stays in a templateized format (let's say, as in a draft format) so that they can come and work again.

### P22 Align the interface with Razorpay

My design instruction.

> Check for that as well so that it feels like it is designed for Razorpay.

### P23 Make screen content understandable

My communication requirement.

> whatever we are showing on the screen should be easy to read as well as self-explanatory in nature.

### P24 Generate a background while reserving product facts for deterministic composition

ImageGen prompt used during the build.

> Keep the central 60 percent calm and empty to receive verified product cards and personalized offer text composited by the application. No product packaging, no people, no medical claims, no words, no logos, no prices, no coupons, no watermark. This is a background asset rather than a screenshot or UI mockup.

### Supporting records

The narrative draws on the research and product conversations, the decision record, and the repository README and implementation records. The relevant decisions, prompt excerpts, verification results and limitations are included directly above. Supporting records are:

- [Product overview and reviewer walkthrough](https://github.com/akshatj28/razorpay-retention-agent/blob/main/README.md)
- [Research and candidate narrowing](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/RESEARCH.md)
- [Dated implementation and verification history](https://github.com/akshatj28/razorpay-retention-agent/blob/main/BUILD_LOG.md)
- [Product decisions and integration boundaries](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/PRODUCT_DECISIONS.md)
- [Historical interface revisions](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/history/UI_REFRESH_NOTES.md)
- [Image prompt and provenance](https://github.com/akshatj28/razorpay-retention-agent/blob/main/docs/CREATIVE_ASSETS.md)
- [Synthetic data dictionary](https://github.com/akshatj28/razorpay-retention-agent/blob/main/data/nira/README.md)
