import { createContext } from "react";
import type { DemoState, Derived } from "./campaign";

export interface DemoContextValue {
  state: DemoState;
  d: Derived;
  update: (fn: (s: DemoState) => DemoState) => void;
  run: (fn: (s: DemoState) => { state: DemoState; error?: string }) => string | undefined;
  reset: () => void;
}

// Keep the context identity outside the React Refresh component module.
// When this module itself is replaced, retain only the context, never demo data.
const retained = import.meta.hot?.data.demoContext as ReturnType<typeof createContext<DemoContextValue | null>> | undefined;
export const DemoContext = retained ?? createContext<DemoContextValue | null>(null);
if (import.meta.hot) import.meta.hot.data.demoContext = DemoContext;