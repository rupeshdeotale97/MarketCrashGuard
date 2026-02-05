# **App Name**: CrashGuard

## Core Features:

- Market Risk Dashboard: Displays current market risk levels for US, India, and Crypto, along with the Global System Risk status.
- Risk Jump Day Indicator: Indicates whether it's a 'Risk Jump Day' based on defined criteria.
- Crash Confirmation Checklist: Auto-evaluated checklist to determine if a market crash is confirmed based on credit stress, volatility, liquidity, and external shocks.
- Suggested Actions: Provides calm, non-emotional guidance based on the current market status.
- Data Fetching and Caching: Fetches daily market risk data from a backend API, caches it locally, and provides graceful fallbacks.
- Investor/Trader Mode: Toggles UI elements and guidance based on the selected mode.
- Risk Assessment Tool: Utilizes logic to aggregate crash factors into the market risk indicators. The LLM is a tool used to provide stay calm guidance.

## Style Guidelines:

- Primary color: Dark blue (#24305E) to convey stability and trust.
- Background color: Very dark gray (#121212) for a calm, dark mode-friendly interface.
- Accent color: Purple (#6A4C93) to highlight important information and actions.
- Font: 'Inter' sans-serif font for both headlines and body text, providing a modern, neutral look.
- Simple, clear icons to represent market risk levels and checklist items.
- Clean, uncluttered layout with clear color-coding (Green/Yellow/Orange/Red) to indicate risk levels.
- Subtle transitions for UI elements and status updates.