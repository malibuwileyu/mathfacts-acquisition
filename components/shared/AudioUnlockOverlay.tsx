/**
 * Invisible overlay that requires a click to unlock audio after page refresh
 * Browsers block autoplay until user interaction - this ensures that happens
 */

'use client';

import { useState, useEffect } from 'react';

interface Props {
  onUnlock: () => void;
}

export default function AudioUnlockOverlay({ onUnlock }: Props) {
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    // Check if this is a page refresh (not initial navigation)
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isRefresh = navEntry?.type === 'reload';
    
    // Also check sessionStorage - if we've been here before in this session
    const hasVisited = sessionStorage.getItem(`lesson-visited-${window.location.pathname}`);
    
    if (isRefresh || hasVisited) {
      setNeedsUnlock(true);
      // Use TTS to say "click to start"
      const utterance = new SpeechSynthesisUtterance('Click to start');
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    
    // Mark as visited for future refreshes
    sessionStorage.setItem(`lesson-visited-${window.location.pathname}`, 'true');
  }, []);

  const handleClick = () => {
    // Stop any TTS
    window.speechSynthesis.cancel();
    setNeedsUnlock(false);
    onUnlock();
  };

  if (!needsUnlock) return null;

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-50 cursor-pointer"
      style={{ background: 'transparent' }}
      aria-label="Click to start audio"
    />
  );
}

