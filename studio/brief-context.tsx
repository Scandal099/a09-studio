"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { captureInitialUtm } from "@/lib/analytics";
import {
  formatIdToServiceOption,
  type AttachedCatalogItem,
  type CaseSlot,
  type CatalogItem,
  type FormatId,
} from "./content";
import { BriefDialog } from "./dialogs";

interface BriefModalContextValue {
  briefOpen: boolean;
  openBrief: (formatId?: FormatId, triggerEl?: HTMLElement | null) => void;
  openSlotBrief: (slot: CaseSlot, triggerEl?: HTMLElement | null) => void;
  openCatalogBrief: (
    item: CatalogItem,
    triggerEl?: HTMLElement | null
  ) => void;
}

const BriefModalContext = createContext<BriefModalContextValue | null>(null);

function resolveFocusTrigger(
  triggerEl?: HTMLElement | null
): HTMLElement | null {
  if (triggerEl) return triggerEl;
  if (
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
  ) {
    return document.activeElement;
  }
  return null;
}

export function BriefModalProvider({ children }: { children: ReactNode }) {
  const [briefOpen, setBriefOpen] = useState(false);
  const [defaultFormatId, setDefaultFormatId] = useState<FormatId | null>(null);
  const [attachedSlot, setAttachedSlot] = useState<CaseSlot | null>(null);
  const [attachedCatalogItem, setAttachedCatalogItem] =
    useState<AttachedCatalogItem | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    captureInitialUtm();
  }, []);

  const openBrief = useCallback(
    (formatId?: FormatId, triggerEl?: HTMLElement | null) => {
      returnFocusRef.current = resolveFocusTrigger(triggerEl);
      setDefaultFormatId(formatId ?? null);
      setAttachedSlot(null);
      setAttachedCatalogItem(null);
      setBriefOpen(true);
    },
    []
  );

  const openSlotBrief = useCallback(
    (slot: CaseSlot, triggerEl?: HTMLElement | null) => {
      returnFocusRef.current = resolveFocusTrigger(triggerEl);
      setDefaultFormatId(slot.formatId);
      setAttachedSlot(slot);
      setAttachedCatalogItem(null);
      setBriefOpen(true);
    },
    []
  );

  const openCatalogBrief = useCallback(
    (item: CatalogItem, triggerEl?: HTMLElement | null) => {
      returnFocusRef.current = resolveFocusTrigger(triggerEl);
      setDefaultFormatId(item.formatId);
      setAttachedSlot(null);
      setAttachedCatalogItem({
        id: item.id,
        name: item.name,
        price: item.price,
      });
      setBriefOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setBriefOpen(false);
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (!target) return;
    // Defer focus one frame so hidden sticky controls become visible before focus()
    window.requestAnimationFrame(() => {
      if (target.isConnected) {
        target.focus();
      }
    });
  }, []);

  return (
    <BriefModalContext.Provider
      value={{ briefOpen, openBrief, openSlotBrief, openCatalogBrief }}
    >
      {children}
      {briefOpen && (
        <BriefDialog
          defaultService={formatIdToServiceOption(defaultFormatId)}
          attachedSlot={attachedSlot}
          onClearSlot={() => setAttachedSlot(null)}
          attachedCatalogItem={attachedCatalogItem}
          onClearCatalogItem={() => setAttachedCatalogItem(null)}
          onClose={handleClose}
        />
      )}
    </BriefModalContext.Provider>
  );
}

export function useBriefModal(): BriefModalContextValue {
  const ctx = useContext(BriefModalContext);
  if (!ctx) {
    throw new Error("useBriefModal must be used inside BriefModalProvider");
  }
  return ctx;
}
