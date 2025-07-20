import { useEffect, useCallback, useRef, useState } from "react";
import { KEYBOARD_SHORTCUTS, type NavigationKey, type SelectionKey } from "@/lib/constants/questionnaire";

interface UseQuestionnaireA11yProps {
  onTraitSelect?: (index: number) => void;
  onAnchorChange?: (index: number, value: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  totalTraits: number;
  totalAnchors: number;
  isLoading?: boolean;
}

export function useQuestionnaireA11y({
  onTraitSelect,
  onAnchorChange,
  onNext,
  onPrevious,
  totalTraits,
  totalAnchors,
  isLoading,
}: UseQuestionnaireA11yProps) {
  const [focusedTrait, setFocusedTrait] = useState<number>(-1);
  const [focusedAnchor, setFocusedAnchor] = useState<number>(-1);
  const lastKeyPress = useRef<number>(0);
  const doubleKeyDelay = 300; // ms

  const handleKeyboardNavigation = useCallback(
    (e: KeyboardEvent) => {
      if (isLoading) return;

      // Prevent default for our handled keys
      const isOurKey = Object.values(KEYBOARD_SHORTCUTS.NAVIGATION).includes(e.key as NavigationKey) ||
                      Object.values(KEYBOARD_SHORTCUTS.SELECTION).includes(e.key as SelectionKey) ||
                      (!isNaN(parseInt(e.key)) && parseInt(e.key) >= 0 && parseInt(e.key) <= 10);
      
      if (isOurKey) {
        e.preventDefault();
      }

      // Handle trait navigation
      if (focusedTrait !== -1) {
        switch (e.key) {
          case KEYBOARD_SHORTCUTS.NAVIGATION.UP:
          case KEYBOARD_SHORTCUTS.NAVIGATION.LEFT:
            setFocusedTrait((prev) => Math.max(0, prev - 1));
            break;
          case KEYBOARD_SHORTCUTS.NAVIGATION.DOWN:
          case KEYBOARD_SHORTCUTS.NAVIGATION.RIGHT:
            setFocusedTrait((prev) => Math.min(totalTraits - 1, prev + 1));
            break;
          case KEYBOARD_SHORTCUTS.SELECTION.SPACE:
          case KEYBOARD_SHORTCUTS.SELECTION.ENTER:
            onTraitSelect?.(focusedTrait);
            break;
        }
      }

      // Handle anchor navigation and value setting
      if (focusedAnchor !== -1) {
        const now = Date.now();
        
        // Handle number keys for anchor values
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 0 && num <= 10) {
          onAnchorChange?.(focusedAnchor, num);
          
          // Auto-advance if double-press
          if (now - lastKeyPress.current < doubleKeyDelay) {
            setFocusedAnchor((prev) => Math.min(totalAnchors - 1, prev + 1));
          }
          lastKeyPress.current = now;
        }

        // Handle navigation
        switch (e.key) {
          case KEYBOARD_SHORTCUTS.NAVIGATION.UP:
            setFocusedAnchor((prev) => Math.max(0, prev - 1));
            break;
          case KEYBOARD_SHORTCUTS.NAVIGATION.DOWN:
            setFocusedAnchor((prev) => Math.min(totalAnchors - 1, prev + 1));
            break;
        }
      }

      // Global navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case KEYBOARD_SHORTCUTS.NAVIGATION.RIGHT:
            onNext?.();
            break;
          case KEYBOARD_SHORTCUTS.NAVIGATION.LEFT:
            onPrevious?.();
            break;
        }
      }
    },
    [
      focusedTrait,
      focusedAnchor,
      totalTraits,
      totalAnchors,
      onTraitSelect,
      onAnchorChange,
      onNext,
      onPrevious,
      isLoading,
    ]
  );

  // Attach keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => window.removeEventListener("keydown", handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // Announce focus changes to screen readers
  useEffect(() => {
    if (focusedTrait !== -1) {
      const element = document.getElementById(`trait-${focusedTrait}`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    if (focusedAnchor !== -1) {
      const element = document.getElementById(`anchor-${focusedAnchor}`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [focusedTrait, focusedAnchor]);

  return {
    focusedTrait,
    focusedAnchor,
    setFocusedTrait,
    setFocusedAnchor,
  };
}
