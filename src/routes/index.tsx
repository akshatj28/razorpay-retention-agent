import { createFileRoute } from "@tanstack/react-router";
import { StudioHome } from "@/components/retention/StudioHome";
export const Route = createFileRoute("/")({
  component: StudioHome,
  head: () => ({
    meta: [
      { title: "Retention opportunities — Nira Botanics" },
      {
        name: "description",
        content:
          "Review personalized retention campaigns and outcome economics for a fictional skincare and haircare brand.",
      },
    ],
  }),
});
