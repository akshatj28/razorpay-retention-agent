import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EvaluatorTour, TOUR_STOPS } from "@/components/retention/EvaluatorTour";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useRouterState: () => "/",
}));

beforeEach(() => { localStorage.clear(); navigate.mockClear(); });
afterEach(cleanup);

describe("Evaluator walkthrough", () => {
  it("offers a first-visit welcome that can be skipped and remembered", () => {
    const view = render(<EvaluatorTour />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore independently" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Evaluator walkthrough" })).not.toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    view.unmount();
    render(<EvaluatorTour />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates all six stops, supports Back, and finishes without campaign actions", () => {
    render(<EvaluatorTour />);
    fireEvent.click(screen.getByRole("button", { name: "Start guided demo" }));
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    for (let index = 0; index < TOUR_STOPS.length; index++) {
      expect(screen.getByRole("heading", { name: TOUR_STOPS[index]!.title })).toBeInTheDocument();
      expect(navigate).toHaveBeenLastCalledWith({ to: TOUR_STOPS[index]!.route });
      if (index < TOUR_STOPS.length - 1) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: TOUR_STOPS[4]!.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.queryByRole("region", { name: "Evaluator walkthrough" })).not.toBeInTheDocument();
    expect(localStorage.getItem("retention-agent-demo-v1")).toBeNull();
  });

  it("can restart and exit with Escape or the exit button", () => {
    localStorage.setItem("retention-evaluator-welcome-v1", "seen");
    render(<EvaluatorTour />);
    const restart = screen.getByRole("button", { name: "Evaluator walkthrough" });
    fireEvent.click(restart);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Evaluator walkthrough" })).not.toBeInTheDocument();
    expect(restart).toHaveFocus();
    fireEvent.click(restart);
    fireEvent.click(screen.getByRole("button", { name: "Exit evaluator walkthrough" }));
    expect(screen.queryByRole("region", { name: "Evaluator walkthrough" })).not.toBeInTheDocument();
  });
});
