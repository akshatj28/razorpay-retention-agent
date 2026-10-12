import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { derive, initialState, type DemoState } from "./campaign";
import { DemoContext } from "./demo-context";

export const STORAGE_KEY = "retention-agent-demo-v2";
const KEY = STORAGE_KEY;

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed?.version === 2 &&
          parsed.config &&
          parsed.campaign &&
          Array.isArray(parsed.simOrders) &&
          Array.isArray(parsed.simContacts) &&
          Array.isArray(parsed?.studio?.campaigns) &&
          Array.isArray(parsed?.studio?.templates) &&
          Array.isArray(parsed?.studio?.arrivals) &&
          Array.isArray(parsed?.studio?.optOutIds) &&
          Number.isFinite(parsed.studio.day)
        )
          setState(parsed);
      }
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);
  // Do not overwrite persisted work with the SSR initial state during StrictMode effect replay.
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        /* Continue in memory if storage is unavailable. */
      }
    }
  }, [state, hydrated]);

  const d = useMemo(() => derive(state), [state]);
  const update = useCallback((fn: (s: DemoState) => DemoState) => setState((s) => fn(s)), []);
  const stateRef = useRef(state);
  stateRef.current = state;
  const run = useCallback((fn: (s: DemoState) => { state: DemoState; error?: string }) => {
    const r = fn(stateRef.current);
    if (!r.error) setState(r.state);
    return r.error;
  }, []);
  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(initialState());
  }, []);
  return (
    <DemoContext.Provider value={{ state, d, update, run, reset }}>{children}</DemoContext.Provider>
  );
}

export function useDemo() {
  const c = useContext(DemoContext);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}
