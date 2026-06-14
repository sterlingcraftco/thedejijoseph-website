export interface Build {
  title: string;
  subtitle: string;
  description: string;
}

// Shared source of truth for the Selected Builds section (Home shows the first
// three) and the full /builds page.
export const builds: Build[] = [
  {
    title: 'Joinda Payments',
    subtitle: 'Crypto payments processor. Built solo.',
    description:
      "Solana as the ledger. WebSocket connections to the blockchain maintained in real time. Inflows swept to a central wallet, outflows verified against Joinda's records before processing. API-first, designed initially for one client with a multi-client architecture already in mind. Built with Starlette.",
  },
  {
    title: 'Uverus Banking',
    subtitle: 'Banking-as-a-service for mid-size corporate organisations and microfinance banks.',
    description:
      'A full core banking product — deployable as a standalone system or as a branded banking layer for organisations that want their own financial product. Led a core team of 6. Built the ledger, audit, and reconciliation services.',
  },
  {
    title: 'Uverus Payments',
    subtitle: 'Payments processing infrastructure.',
    description:
      'Built the ledger, audit, and reconciliation services — the core financial plumbing that makes payments reliable and traceable at scale.',
  },
  {
    title: 'ASHIA Portal',
    subtitle: 'Management portal for the Anambra State Health Insurance Agency.',
    description:
      'Enrolments, claims, internal messaging, accounting, payouts — across multiple user types and permission levels. Led a team of 8.',
  },
  {
    title: 'myStash SMS Parser',
    subtitle: 'Built in an internal hackathon. Critical infrastructure.',
    description:
      "myStash needed to read users' bank SMS alerts to calculate daily income and trigger automatic savings. I built the parser that made that possible — extracted transaction data from unstructured SMS text and fed it into the savings logic.",
  },
  {
    title: 'Fembol Operations Tracker',
    subtitle: 'AppSheet + Google Sheets. Built as an internal tool, later extended.',
    description:
      'Tracked 20–30 container transport jobs a week — trucks, containers, agents, clients, timelines. Later rebuilt as a financial dashboard: pending income, cost breakdowns by operation type and client, bank balances. Full operational picture in one place.',
  },
];
