import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, test } from "vitest";
import { DemoStoreProvider, useDemo, STORAGE_KEY } from "@/retention/store";
import { createDraft, editDraft } from "@/retention/studio";
function Probe() {
  const { state, update } = useDemo();
  return (
    <>
      <button
        onClick={() =>
          update((s) => {
            const studio = createDraft(s.studio);
            return {
              ...s,
              studio: editDraft(studio, studio.activeId!, { name: "Saved merchant work" }),
            };
          })
        }
      >
        Create saved work
      </button>
      <div>{state.studio.campaigns.map((c) => c.name).join(",") || "No saved work"}</div>
    </>
  );
}
beforeEach(() => localStorage.clear());
afterEach(cleanup);
test("drafts survive a StrictMode mount, unmount and reload", async () => {
  const first = render(
    <StrictMode>
      <DemoStoreProvider>
        <Probe />
      </DemoStoreProvider>
    </StrictMode>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create saved work" }));
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).studio.campaigns[0].name).toBe(
      "Saved merchant work",
    ),
  );
  first.unmount();
  render(
    <StrictMode>
      <DemoStoreProvider>
        <Probe />
      </DemoStoreProvider>
    </StrictMode>,
  );
  await waitFor(() => expect(screen.getByText("Saved merchant work")).toBeInTheDocument());
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).studio.campaigns).toHaveLength(1);
});
test("invalid persisted JSON falls back to an editable initial state", () => {
  localStorage.setItem(STORAGE_KEY, '{"version":2,"studio":{"campaigns":[]}}');
  render(
    <DemoStoreProvider>
      <Probe />
    </DemoStoreProvider>,
  );
  expect(screen.getByText("No saved work")).toBeInTheDocument();
});
