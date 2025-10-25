/**
 * Hook for tracking user behavioral signals
 */

import { useEffect, useRef, useState } from 'react';
import type { BehavioralSignals } from '@/lib/security/behavioral-signals';

export function useBehavioralTracking() {
  const [signals, setSignals] = useState<BehavioralSignals>({
    mouseMovements: 0,
    keystrokes: 0,
    timeOnPage: 0,
    formFillTime: 0,
    clipboardPaste: false,
    rapidSubmission: false,
  });

  const pageLoadTime = useRef<number>(Date.now());
  const firstInteractionTime = useRef<number | null>(null);
  const mouseMovementCount = useRef<number>(0);
  const keystrokeCount = useRef<number>(0);
  const hasDetectedPaste = useRef<boolean>(false);

  useEffect(() => {
    // Track mouse movements
    const handleMouseMove = () => {
      mouseMovementCount.current++;
      if (!firstInteractionTime.current) {
        firstInteractionTime.current = Date.now();
      }
    };

    // Track keystrokes
    const handleKeyDown = () => {
      keystrokeCount.current++;
      if (!firstInteractionTime.current) {
        firstInteractionTime.current = Date.now();
      }
    };

    // Track paste events
    const handlePaste = () => {
      hasDetectedPaste.current = true;
    };

    // Update signals periodically
    const interval = setInterval(() => {
      const now = Date.now();
      const timeOnPage = now - pageLoadTime.current;
      const formFillTime = firstInteractionTime.current 
        ? now - firstInteractionTime.current 
        : 0;

      setSignals({
        mouseMovements: mouseMovementCount.current,
        keystrokes: keystrokeCount.current,
        timeOnPage,
        formFillTime,
        clipboardPaste: hasDetectedPaste.current,
        rapidSubmission: timeOnPage < 1000,
      });
    }, 500); // Update every 500ms

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  return signals;
}

