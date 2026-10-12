import { BottomSheet, BottomSheetBody, BottomSheetFooter, BottomSheetHeader, Modal, ModalBody, ModalFooter, ModalHeader, useTheme } from "@razorpay/blade/components";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Blade recommends BottomSheet on mobile and Modal on desktop. */
export function AppModal({ isOpen, onDismiss, title, subtitle, children, footer, size = "small" }: {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "small" | "medium";
}) {
  const { theme } = useTheme();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${theme.breakpoints.m - 1}px)`);
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [theme.breakpoints.m]);
  // Closed dialogs have no content or focus trap, and do not mount desktop-only
  // Blade modals on a mobile screen. Dismissal returns focus through Blade.
  if (!isOpen) return null;
  const header = { title, ...(subtitle ? { subtitle } : {}) };
  // Blade's web BottomSheet does not portal itself. Keep it outside animated
  // page containers, whose transforms otherwise constrain its fixed position.
  if (mobile) return createPortal(<BottomSheet isOpen onDismiss={onDismiss}>
    <BottomSheetHeader {...header} />
    <BottomSheetBody>{children}</BottomSheetBody>
    {footer && <BottomSheetFooter>{footer}</BottomSheetFooter>}
  </BottomSheet>, document.body);
  return <Modal isOpen onDismiss={onDismiss} accessibilityLabel={title} size={size}>
    <ModalHeader {...header} />
    <ModalBody>{children}</ModalBody>
    {footer && <ModalFooter>{footer}</ModalFooter>}
  </Modal>;
}
