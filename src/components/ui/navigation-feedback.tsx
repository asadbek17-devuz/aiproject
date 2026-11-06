"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MorphingInfinity } from "@/components/ui/morphing-infinity";

const MIN_VISIBLE_MS = 420;
const EXIT_MS = 180;
const WATCHDOG_MS = 12_000;

function isPlainNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return false;
  }
  return true;
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const routeRef = useRef(routeKey);
  const pendingRef = useRef(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    hideTimer.current = null;
    exitTimer.current = null;
    watchdogTimer.current = null;
  }, []);

  const scheduleHide = useCallback((delayMs: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    hideTimer.current = setTimeout(() => {
      pendingRef.current = false;
      setLeaving(true);
      exitTimer.current = setTimeout(() => {
        setActive(false);
        setLeaving(false);
      }, EXIT_MS);
    }, delayMs);
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    pendingRef.current = false;
    setLeaving(false);
    setActive(false);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    startedAt.current = performance.now();
    pendingRef.current = true;
    setLeaving(false);
    setActive(true);
    watchdogTimer.current = setTimeout(finish, WATCHDOG_MS);
  }, [clearTimers, finish]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (isPlainNavigation(event, anchor)) start();
    };

    const onPopState = () => {
      start();
      scheduleHide(MIN_VISIBLE_MS);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      clearTimers();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [clearTimers, scheduleHide, start]);

  useEffect(() => {
    if (routeRef.current === routeKey) return;
    routeRef.current = routeKey;
    if (!pendingRef.current) return;

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
      watchdogTimer.current = null;
    }

    const elapsed = performance.now() - startedAt.current;
    scheduleHide(Math.max(0, MIN_VISIBLE_MS - elapsed));
  }, [routeKey, scheduleHide]);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-canvas/90 backdrop-blur-sm transition-opacity duration-200 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex size-28 items-center justify-center rounded-[2rem] border-2 border-white bg-white/90 shadow-lift">
        <MorphingInfinity className="size-16 text-primary-600" />
      </div>
      <div className="text-center">
        <p className="font-display text-lg font-extrabold text-ink">Sahifa yuklanmoqda</p>
        <p className="mt-1 text-xs font-semibold text-muted">Keyingi bo&apos;lim tayyorlanmoqda…</p>
      </div>
    </div>
  );
}
