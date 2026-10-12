import { Button, ArrowRightIcon } from "@razorpay/blade/components";
import { useNavigate } from "@tanstack/react-router";

/** Keep normal anchor behaviour (including new tabs) while using client-side routing. */
export function LinkButton({
  to,
  children,
  size = "medium",
  color = "primary",
}: {
  to:
    | "/"
    | "/setup"
    | "/cohort"
    | "/workbench"
    | "/review"
    | "/campaigns"
    | "/database"
    | "/insights";
  children: string;
  size?: "medium" | "large";
  color?: "primary" | "white";
}) {
  const navigate = useNavigate();
  return (
    <Button
      href={to}
      size={size}
      color={color}
      icon={ArrowRightIcon}
      iconPosition="right"
      onClick={(event) => {
        if (
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          void navigate({ to });
        }
      }}
    >
      {children}
    </Button>
  );
}
