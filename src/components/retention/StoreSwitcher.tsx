import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Plug, Plus, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DEMO_STORE,
  getStores,
  SETUP_EVENT,
  showConnections,
  startAddStore,
  type ConnectedStore,
} from "@/retention/onboarding";

/** Workspace menu: switch store, add a store, or manage connections. */
export function StoreSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<ConnectedStore[]>([DEMO_STORE]);
  const [notice, setNotice] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setStores(getStores());
    load();
    window.addEventListener(SETUP_EVENT, load);
    return () => window.removeEventListener(SETUP_EVENT, load);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted";
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm font-medium hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setNotice(null);
        }}
      >
        <Store className="size-4 text-muted-foreground" aria-hidden />
        <span className="flex-1 truncate">{DEMO_STORE.name}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Stores"
          className="absolute top-full right-0 left-0 z-30 mt-1 rounded-lg border bg-card p-1 shadow-lg"
        >
          {stores.map((st) => (
            <button
              key={st.domain}
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                if (st.hasData) setOpen(false);
                else
                  setNotice(
                    `${st.name} is connected, but this demo only has sample orders for ${DEMO_STORE.name}.`,
                  );
              }}
            >
              <Store className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{st.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {st.hasData ? "Connected" : "Connected · no sample data"}
                </span>
              </span>
              {st.domain === DEMO_STORE.domain && (
                <Check className="size-4 text-primary" aria-label="Current store" />
              )}
            </button>
          ))}
          {notice && (
            <p role="status" className="px-2 py-1.5 text-xs text-muted-foreground">
              {notice}
            </p>
          )}
          <div className="my-1 border-t" />
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              startAddStore();
              setOpen(false);
              void navigate({ to: "/setup" });
            }}
          >
            <Plus className="size-4 shrink-0 text-primary" aria-hidden />
            Add store
          </button>
          <Link
            to="/setup"
            role="menuitem"
            className={item}
            onClick={() => {
              showConnections();
              setOpen(false);
            }}
          >
            <Plug className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Manage connections
          </Link>
        </div>
      )}
    </div>
  );
}
