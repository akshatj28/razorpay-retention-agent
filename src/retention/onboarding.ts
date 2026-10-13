// Connections and setup progress are per-browser conveniences, kept apart from the campaign state
// so "Reset demo" stays exact.
export const SETUP_KEY = "retention-agent-setup-v2";
export const STORES_KEY = "retention-agent-stores-v1";
/** Fired when setup progress or connected stores change, so the sidebar updates in place. */
export const SETUP_EVENT = "retention-setup-change";

export interface ConnectedStore {
  domain: string;
  name: string;
  /** Only the seeded demo store has order history in this prototype. */
  hasData: boolean;
}
export const DEMO_STORE: ConnectedStore = {
  domain: "nira-botanics.myshopify.com",
  name: "Nira Botanics",
  hasData: true,
};
/** Pre-filled address for the add-store walkthrough. */
export const SAMPLE_NEW_STORE = "verde-home.myshopify.com";

export const storeName = (domain: string) =>
  domain
    .replace(/\.myshopify\.com$/i, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");

export function getStores(): ConnectedStore[] {
  try {
    const raw = localStorage.getItem(STORES_KEY);
    const added = raw ? (JSON.parse(raw) as ConnectedStore[]) : [];
    return [DEMO_STORE, ...added.filter((x) => x.domain !== DEMO_STORE.domain)];
  } catch {
    return [DEMO_STORE];
  }
}

export function addStore(domain: string) {
  const clean = domain.trim().toLowerCase();
  const stores = getStores();
  if (stores.some((x) => x.domain === clean)) return;
  const added = [...stores.slice(1), { domain: clean, name: storeName(clean), hasData: false }];
  try {
    localStorage.setItem(STORES_KEY, JSON.stringify(added));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(SETUP_EVENT));
}

/** Opens the add-store walkthrough from anywhere, starting at its first screen. */
export function startAddStore() {
  try {
    localStorage.setItem(
      SETUP_KEY,
      JSON.stringify({ step: "store", domain: SAMPLE_NEW_STORE, channel: "whatsapp-voice" }),
    );
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(SETUP_EVENT));
}

/** Shows the connections list, leaving any unfinished add-store walkthrough. */
export function showConnections() {
  try {
    localStorage.removeItem(SETUP_KEY);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(SETUP_EVENT));
}
