<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture rules

- Retention logic lives in `src/retention/` as pure modules (data, features, forecast, policy, recommend, campaign); UI only reads `derive(state)` — single source of truth so counts agree across screens.
- Base dataset is regenerated from a fixed seed and never persisted; only merchant edits and simulated events go to localStorage — makes Reset exact.
- No external services, Cloud, or network calls — the brief requires an offline demo.
- Fonts are self-hosted in `public/fonts` — no CDN requests.
- Strategy comparisons use the same identified eligible non-holdout decision audience without overrides; nonlaunchable totals are counterfactual only and executableTotals is null, preventing blocked forecasts being presented as executable.
- Holdout membership retains the campaign/customer hash threshold rather than exact-size sampling; report actual eligible-relative percentages so existing campaign assignments remain stable.
- Demo context identity lives in a separate browser-safe module and survives hot replacement; providers and consumers must share it so preview updates cannot detach the mounted store.

## Campaign Studio and exports

- Nira Botanics history is generated once from seed 20261012. Exactly 30,000 orders in six rolling calendar-month windows; CSV/SQLite must regenerate from this source, not an independent dataset.
- Studio logic and outcome ledger live in pure src/retention/studio.ts. UI only reads the shared derive(state) result.
- Persist merchant work/events only under retention-agent-demo-v2. Hydration must finish before writing so StrictMode cannot overwrite saved drafts.
- Daily opportunity refresh preserves assets and merchant settings. Approval freezes revision, recipients, offers, assets and holdout assignments. No silent audience expansion.
- Full approved experiment assignments, including controls, are reserved across campaigns. Treatment accounting includes skipped/no-outreach assignments.
- Before sends, recheck channel permissions, open/pending orders, recent purchases, stock, frequency, campaign expiry and internal operator spend.
- Attribution, pending orders, collected outcomes and incremental contribution are distinct. No success-fee finalization before reconciliation; campaign losses offset wins before the illustrative portfolio share. Real invoicing is not implemented.
- Network/LLM/channel adapters remain simulated. The locally generated ImageGen background is a static project asset, not a runtime external call.
