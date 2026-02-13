export type OnboardingAction = {
  id: string;
  label: string;
  variant?: "default" | "outline";
};

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  targetId?: string;
  placement?: "auto" | "top" | "bottom";
  actions?: OnboardingAction[];
};

export const ONBOARDING_TOUR_STORAGE_KEY = "guardmarketcrash_onboarding_seen_v1";
export const ONBOARDING_TOUR_FORCE_KEY = "guardmarketcrash_onboarding_force_v1";

export const DASHBOARD_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to GuardMarketCrash",
    description:
      "We monitor real-time market stress signals and translate them into simple crash-risk guidance so you can react faster.",
    placement: "auto",
  },
  {
    id: "risk-score",
    title: "Market Risk Score",
    description:
      "This score summarizes current risk conditions. Green = Safe, Yellow = Caution, Red = High Risk.",
    targetId: "market-risk-score",
    placement: "bottom",
  },
  {
    id: "market-breakdown",
    title: "Market Breakdown",
    description:
      "Track risk by segment (US, India, Crypto, Global) to spot where stress is concentrated.",
    targetId: "market-breakdown",
    placement: "bottom",
  },
  {
    id: "alerts",
    title: "Crash Alerts",
    description:
      "Alerts trigger when threshold conditions are met. Turn on notifications to get warned when risk escalates.",
    targetId: "alerts-section",
    placement: "top",
  },
  {
    id: "actions",
    title: "Recommended Actions",
    description:
      "These are defensive actions tailored to the current regime so you can reduce downside quickly.",
    targetId: "recommended-actions",
    placement: "top",
  },
  {
    id: "finish",
    title: "You are ready",
    description:
      "Enable alerts for instant warnings, or continue to your dashboard now.",
    targetId: "dashboard-cta",
    placement: "top",
    actions: [
      { id: "enable-alerts", label: "Enable Alerts", variant: "default" },
      { id: "go-dashboard", label: "Go to Dashboard", variant: "outline" },
    ],
  },
];

export const SCANNER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "scanner-welcome",
    title: "Scanner Overview",
    description:
      "This screen helps you stress-test your allocation, parse CAS statements, and generate a defensive action plan.",
    placement: "auto",
  },
  {
    id: "scanner-market-pulse",
    title: "Market Pulse",
    description:
      "Track real-time regime context from major indicators before changing your portfolio mix.",
    targetId: "scanner-market-pulse",
    placement: "bottom",
  },
  {
    id: "scanner-shock",
    title: "Shock Simulator",
    description:
      "Use Stress Level to simulate sudden drawdowns and review how risk posture should shift.",
    targetId: "scanner-shock-simulator",
    placement: "bottom",
  },
  {
    id: "scanner-cas",
    title: "CAS Upload",
    description:
      "Upload your statement to auto-extract allocation and compare it against defensive recommendations.",
    targetId: "scanner-cas-upload",
    placement: "top",
  },
  {
    id: "scanner-actions",
    title: "Next Action",
    description:
      "Apply the suggested mix, then export your action plan PDF for execution and review.",
    targetId: "scanner-next-action",
    placement: "top",
    actions: [{ id: "go-dashboard", label: "Go to Dashboard", variant: "outline" }],
  },
];

export const PLAYBOOKS_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "library-welcome",
    title: "Library Overview",
    description:
      "Crash Playbooks provide scenario-specific defensive guidance for extreme market regimes.",
    placement: "auto",
  },
  {
    id: "library-highlights",
    title: "Library Highlights",
    description:
      "Use these quick tiles to understand coverage depth and high-severity risk regimes.",
    targetId: "library-highlights",
    placement: "bottom",
  },
  {
    id: "library-playbook",
    title: "Playbook Drilldown",
    description:
      "Open a playbook to review defensive actions, fatal mistakes, and first 24-hour priorities.",
    targetId: "library-playbooks-list",
    placement: "top",
  },
];

export const SETTINGS_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "settings-welcome",
    title: "Settings Overview",
    description:
      "Control notifications, contact support, and replay onboarding from one place.",
    placement: "auto",
  },
  {
    id: "settings-alerts",
    title: "Alerts Toggle",
    description:
      "Enable risk notifications so threshold-based crash alerts can reach you early.",
    targetId: "settings-risk-alerts",
    placement: "bottom",
  },
  {
    id: "settings-replay",
    title: "Replay Tour",
    description:
      "Use Replay Tour anytime to revisit the dashboard walkthrough.",
    targetId: "settings-replay-tour",
    placement: "top",
  },
];

export const ONBOARDING_TOUR_SUPPORTED_PATHS = ["/", "/scanner", "/playbooks", "/settings"] as const;

export function getTourStepsForPath(pathname: string): OnboardingStep[] {
  if (pathname === "/scanner") return SCANNER_ONBOARDING_STEPS;
  if (pathname === "/playbooks") return PLAYBOOKS_ONBOARDING_STEPS;
  if (pathname === "/settings") return SETTINGS_ONBOARDING_STEPS;
  return DASHBOARD_ONBOARDING_STEPS;
}

export function getTourSeenKey(pathname: string) {
  return `${ONBOARDING_TOUR_STORAGE_KEY}:${pathname}`;
}
