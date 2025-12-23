/**
 * Auto Save Hook
 * Provides debounced auto-save functionality for whiteboard snapshots
 */

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions {
  /**
   * Data to save
   */
  data: unknown;
  /**
   * Save function to call
   */
  onSave: (data: unknown) => Promise<void>;
  /**
   * Debounce delay in milliseconds (default: 2000ms)
   */
  delay?: number;
  /**
   * Whether auto-save is enabled (default: true)
   */
  enabled?: boolean;
}

/**
 * useAutoSave Hook
 * Automatically saves data after a delay when data changes
 * Uses deep comparison to detect actual data changes
 * 
 * @param options - Auto-save configuration
 * @returns Manual save function
 */
export function useAutoSave({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);

  /**
   * Manual save function
   */
  const save = useCallback(async () => {
    if (isSavingRef.current) {
      return; // Already saving
    }

    // Serialize data for comparison
    const dataString = JSON.stringify(data);

    // Skip if data hasn't changed
    if (lastSavedDataRef.current === dataString) {
      return;
    }

    isSavingRef.current = true;
    try {
      await onSave(data);
      lastSavedDataRef.current = dataString;
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Don't update lastSavedDataRef on error so it will retry
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave]);

  /**
   * Clear existing timeout and set new one
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Serialize data for comparison
    const dataString = JSON.stringify(data);

    // Skip if data hasn't changed
    if (lastSavedDataRef.current === dataString) {
      return;
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return save;
}

