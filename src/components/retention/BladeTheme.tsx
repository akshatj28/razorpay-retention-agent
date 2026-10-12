import { BladeProvider, useTheme } from "@razorpay/blade/components";
import { bladeTheme } from "@razorpay/blade/tokens";
import { cloneElement, useMemo, type ReactElement, type ReactNode, type StyleHTMLAttributes } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export function BladeTheme({ children }: { children: ReactNode }) {
  // Every server render owns its sheet. A shared sheet would leak rules between requests.
  const sheet = useMemo(() => typeof document === "undefined" ? new ServerStyleSheet() : null, []);
  const content = <BladeProvider themeTokens={bladeTheme} colorScheme="light"><ThemeStyles />{children}{sheet && <ServerStyles sheet={sheet} />}</BladeProvider>;
  return sheet ? <StyleSheetManager sheet={sheet.instance}>{content}</StyleSheetManager> : content;
}

function ServerStyles({ sheet }: { sheet: ServerStyleSheet }) {
  // Render after the screen to collect its rules. React 19 hoists these resources into
  // the head, where styled-components can rehydrate them without a flash of plain controls.
  return <>{sheet.getStyleElement().map((element, index) => cloneElement(element as ReactElement<StyleHTMLAttributes<HTMLStyleElement>>, {
    key: `blade-ssr-${index}`, href: `blade-ssr-${index}`, precedence: "blade",
  }))}</>;
}

/** Share Blade's resolved tokens with custom app layouts, including portalled content. */
function ThemeStyles() {
  const { theme } = useTheme();
  const { surface, interactive, feedback } = theme.colors;
  const variables: Record<string, string> = {
    background: surface.background.gray.moderate,
    surface: surface.background.gray.moderate,
    foreground: surface.text.gray.normal,
    card: surface.background.gray.intense,
    "card-foreground": surface.text.gray.normal,
    popover: surface.background.gray.intense,
    "popover-foreground": surface.text.gray.normal,
    primary: interactive.background.primary.default,
    "primary-foreground": interactive.text.onPrimary.normal,
    "primary-subtle": surface.background.primary.subtle,
    secondary: surface.background.gray.moderate,
    "secondary-foreground": surface.text.gray.normal,
    muted: surface.background.gray.moderate,
    "muted-foreground": surface.text.gray.muted,
    accent: surface.background.primary.subtle,
    "accent-foreground": surface.text.primary.normal,
    destructive: feedback.text.negative.intense,
    "destructive-foreground": surface.text.staticWhite.normal,
    "destructive-subtle": feedback.background.negative.subtle,
    success: feedback.text.positive.intense,
    "success-subtle": feedback.background.positive.subtle,
    warning: feedback.text.notice.intense,
    "warning-subtle": feedback.background.notice.subtle,
    border: surface.border.gray.muted,
    input: interactive.border.gray.default,
    ring: interactive.border.primary.default,
    sidebar: surface.background.gray.intense,
    "sidebar-foreground": surface.text.gray.normal,
    "sidebar-primary": interactive.background.primary.default,
    "sidebar-primary-foreground": interactive.text.onPrimary.normal,
    "sidebar-accent": surface.background.primary.subtle,
    "sidebar-accent-foreground": surface.text.primary.normal,
    "sidebar-border": surface.border.gray.muted,
    "sidebar-ring": interactive.border.primary.default,
    radius: `${theme.border.radius.medium}px`,
  };
  return <style data-blade-app-tokens>{`:root{${Object.entries(variables).map(([key, value]) => `--${key}:${value};`).join("")}}`}</style>;
}
