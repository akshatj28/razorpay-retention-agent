import { BladeTheme } from "@/components/retention/BladeTheme";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EvaluatorTour, TOUR_STOPS } from "@/components/retention/EvaluatorTour";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useRouterState: () => "/",
}));

beforeEach(() => {
  localStorage.clear();
  navigate.mockClear();
});
afterEach(cleanup);

describe("Evaluator walkthrough", () => {
  it("offers a first-visit welcome that can be skipped and remembered", async () => {
    const view = render(
      <BladeTheme>
        <EvaluatorTour />
      </BladeTheme>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore on my own" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(screen.queryByRole("region", { name: "Guided tour" })).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({ to: "/setup" });
    view.unmount();
    render(
      <BladeTheme>
        <EvaluatorTour />
      </BladeTheme>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates every stop, supports Back, and finishes without campaign actions", async () => {
    render(
      <BladeTheme>
        <EvaluatorTour />
      </BladeTheme>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Take the guided tour" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    for (let index = 0; index < TOUR_STOPS.length; index++) {
      expect(screen.getByRole("heading", { name: TOUR_STOPS[index]!.title })).toBeInTheDocument();
      expect(navigate).toHaveBeenLastCalledWith({ to: TOUR_STOPS[index]!.route });
      if (index < TOUR_STOPS.length - 1)
        fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("heading", { name: TOUR_STOPS[TOUR_STOPS.length - 2]!.title }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.queryByRole("region", { name: "Guided tour" })).not.toBeInTheDocument();
    expect(localStorage.getItem("retention-agent-demo-v1")).toBeNull();
  });

  it("can restart and exit with Escape or the exit button", () => {
    localStorage.setItem("retention-evaluator-welcome-v1", "seen");
    render(
      <BladeTheme>
        <EvaluatorTour />
      </BladeTheme>,
    );
    const restart = screen.getByRole("button", { name: "Guided tour" });
    fireEvent.click(restart);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Guided tour" })).not.toBeInTheDocument();
    expect(restart).toHaveFocus();
    fireEvent.click(restart);
    fireEvent.click(screen.getByRole("button", { name: "Exit guided tour" }));
    expect(screen.queryByRole("region", { name: "Guided tour" })).not.toBeInTheDocument();
  });
});
