import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { derive, initialState, type DemoState, type Derived } from "./campaign";

const KEY = "retention-agent-demo-v1";

interface Ctx {
  state: DemoState;
  d: Derived;
  update: (fn: (s: DemoState) => DemoState) => void;
  run: (fn: (s: DemoState) => { state: DemoState; error?: string }) => string | undefined;
  reset: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const parsed = JSON.parse(raw); if (parsed?.version === 1) setState(parsed); }
    } catch { /* ignore corrupt state */ }
    loaded.current = true;
  }, []);
  useEffect(() => { if (loaded.current) localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const d = useMemo(() => derive(state), [state]);
  const update = useCallback((fn: (s: DemoState) => DemoState) => setState((s) => fn(s)), []);
  const stateRef = useRef(state);
  stateRef.current = state;
  const run = useCallback((fn: (s: DemoState) => { state: DemoState; error?: string }) => {
    const r = fn(stateRef.current);
    if (!r.error) setState(r.state);
    return r.error;
  }, []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); setState(initialState()); }, []);
  return <StoreCtx.Provider value={{ state, d, update, run, reset }}>{children}</StoreCtx.Provider>;
}

export function useDemo() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}
