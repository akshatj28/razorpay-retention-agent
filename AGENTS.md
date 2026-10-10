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
