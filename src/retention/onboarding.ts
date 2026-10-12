// Onboarding progress is a per-browser convenience, kept apart from the campaign state so "Reset demo" stays exact.
export const SETUP_KEY = "retention-agent-setup-v1";
/** Fired when setup progress is saved, so the sidebar status updates without a page change. */
export const SETUP_EVENT = "retention-setup-change";

export function isStoreConnected() {
  try {
    const raw = localStorage.getItem(SETUP_KEY);
    return !!raw && JSON.parse(raw).step === "done";
  } catch {
    return false;
  }
}
