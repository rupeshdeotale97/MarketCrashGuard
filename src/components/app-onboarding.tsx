"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OnboardingTour } from "@/components/onboarding-tour";
import {
  getTourSeenKey,
  getTourStepsForPath,
  ONBOARDING_TOUR_FORCE_KEY,
  ONBOARDING_TOUR_SUPPORTED_PATHS,
  type OnboardingStep,
} from "@/lib/onboarding-tour";

export function AppOnboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isSupportedPath = useMemo(
    () => ONBOARDING_TOUR_SUPPORTED_PATHS.includes(pathname as (typeof ONBOARDING_TOUR_SUPPORTED_PATHS)[number]),
    [pathname]
  );

  const steps: OnboardingStep[] = useMemo(() => getTourStepsForPath(pathname), [pathname]);

  useEffect(() => {
    if (!isSupportedPath) {
      setOpen(false);
      return;
    }

    const forceTour = localStorage.getItem(ONBOARDING_TOUR_FORCE_KEY) === "true";
    const hasSeenForPath = localStorage.getItem(getTourSeenKey(pathname)) === "true";

    if (forceTour || !hasSeenForPath) {
      setOpen(true);
      if (forceTour) localStorage.removeItem(ONBOARDING_TOUR_FORCE_KEY);
      return;
    }

    setOpen(false);
  }, [isSupportedPath, pathname]);

  const closeTour = () => {
    if (isSupportedPath) localStorage.setItem(getTourSeenKey(pathname), "true");
    localStorage.removeItem(ONBOARDING_TOUR_FORCE_KEY);
    setOpen(false);
  };

  const handleAction = (actionId: string) => {
    if (actionId === "enable-alerts") {
      closeTour();
      router.push("/settings");
      return;
    }

    if (actionId === "go-dashboard") {
      closeTour();
      router.push("/");
    }
  };

  if (!isSupportedPath) return null;

  return (
    <OnboardingTour
      open={open}
      steps={steps}
      onClose={closeTour}
      onComplete={closeTour}
      onAction={handleAction}
    />
  );
}
