'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Secret admin access hooks — multiple hidden entry points to open the admin panel.
 *
 * Entry points:
 * 1. 🔑 Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
 * 2. ⌨️  Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A on Mac)
 * 3. 🔗 URL hash: #admin
 * 4. 🖱️  Quintuple-click (5x) on the page logo/name element
 *
 * Usage:
 *   useSecretAdmin(() => setViewMode('admin'));
 */

// Konami Code sequence: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useSecretAdmin(onActivate: () => void) {
  const konamiBuffer = useRef<string[]>([]);
  const lastClickTime = useRef<number>(0);
  const clickCount = useRef<number>(0);
  let clickTimer: ReturnType<typeof setTimeout>;

  // 1. Konami Code listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      konamiBuffer.current.push(e.code);
      if (konamiBuffer.current.length > KONAMI_CODE.length) {
        konamiBuffer.current.shift();
      }
      if (konamiBuffer.current.length === KONAMI_CODE.length &&
          konamiBuffer.current.every((key, i) => key === KONAMI_CODE[i])) {
        konamiBuffer.current = [];
        onActivate();
        showEasterEggToast();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);

  // 2. Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        onActivate();
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [onActivate]);

  // 3. URL hash: #admin
  useEffect(() => {
    function handleHash() {
      if (window.location.hash === '#admin') {
        window.location.hash = '';
        onActivate();
      }
    }

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [onActivate]);

  // 4. Triple-click handler (to attach to logo/name element)
  const handleTripleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 500) {
      clickCount.current++;
    } else {
      clickCount.current = 1;
    }
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      onActivate();
    }
  }, [onActivate]);

  return { handleTripleClick };
}

function showEasterEggToast() {
  // Create a fun toast notification when Konami code is entered
  if (typeof document === 'undefined') return;

  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      padding: 12px 20px;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      color: #00ff88;
      font-family: monospace;
      font-size: 14px;
      backdrop-filter: blur(10px);
      animation: easterEggIn 0.3s ease-out;
    ">
      🎮 Konami Code Activated!
    </div>
    <style>
      @keyframes easterEggIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
