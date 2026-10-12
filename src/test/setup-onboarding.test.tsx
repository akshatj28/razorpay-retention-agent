import { BladeTheme } from "@/components/retention/BladeTheme";
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoStoreProvider } from "@/retention/store";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: object) => opts,
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: unknown }) => children,
}));

const { Route } = await import("@/routes/setup");
const Setup = (Route as unknown as { component: () => ReactElement }).component;

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("Store setup onboarding", () => {
  it("walks a merchant from Shopify install to a ready agent without touching campaign state", async () => {
    render(
      <BladeTheme>
        <DemoStoreProvider>
          <Setup />
        </DemoStoreProvider>
      </BladeTheme>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Install on Shopify" }));
    expect(await screen.findByText("Read orders and line items")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Install app" }));

    expect(await screen.findByText("Link your Razorpay data")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Link and continue" }));

    expect(await screen.findByText("Importing your order history")).toBeInTheDocument();
    expect(await screen.findByText("Data check", {}, { timeout: 5000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("How should the agent reach customers?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish setup" }));

    expect(await screen.findByText("Retention Agent is ready.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("retention-agent-setup-v1")!).step).toBe("done");
    expect(JSON.parse(localStorage.getItem("retention-agent-demo-v2")!).campaign.status).toBe(
      "draft",
    );
  }, 15000);

  it("blocks install until the address is a myshopify.com store", () => {
    render(
      <BladeTheme>
        <DemoStoreProvider>
          <Setup />
        </DemoStoreProvider>
      </BladeTheme>,
    );
    fireEvent.change(screen.getByLabelText("Shopify store address"), {
      target: { value: "everyday-essentials.com" },
    });
    expect(screen.getByRole("button", { name: "Install on Shopify" })).toBeDisabled();
  });
});
