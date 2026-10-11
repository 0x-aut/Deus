export interface CatalogTool {
  /** Composio toolkit slug, e.g. "gmail", "slack" */
  slug: string;
  name: string;
  description: string;
  category: "Communication" | "Productivity" | "CRM & Sales" | "Payments" | "Developer" | "Data";
  /** simpleicons.org slug used for the logo, e.g. "gmail" */
  icon: string;
  /** fallback domain for the logo / docs link */
  domain: string;
  authType: "OAuth2" | "API Key" | "None";
}

export const TOOL_CATEGORIES = [
  "Communication",
  "Productivity",
  "CRM & Sales",
  "Payments",
  "Developer",
  "Data",
] as const;

export const TOOL_CATALOG: CatalogTool[] = [
  { slug: "gmail", name: "Gmail", description: "Read, search and send emails on behalf of your agents.", category: "Communication", icon: "gmail", domain: "mail.google.com", authType: "OAuth2" },
  { slug: "slack", name: "Slack", description: "Send messages, read channels and answer threads.", category: "Communication", icon: "slack", domain: "slack.com", authType: "OAuth2" },
  { slug: "outlook", name: "Outlook", description: "Manage inbox, calendar invites and contacts.", category: "Communication", icon: "microsoftoutlook", domain: "outlook.live.com", authType: "OAuth2" },
  { slug: "notion", name: "Notion", description: "Create pages, update databases and docs.", category: "Productivity", icon: "notion", domain: "notion.so", authType: "OAuth2" },
  { slug: "googlesheets", name: "Google Sheets", description: "Read and write rows your agents can reason over.", category: "Productivity", icon: "googlesheets", domain: "docs.google.com", authType: "OAuth2" },
  { slug: "googlecalendar", name: "Google Calendar", description: "Check availability, book and reschedule events.", category: "Productivity", icon: "googlecalendar", domain: "calendar.google.com", authType: "OAuth2" },
  { slug: "linear", name: "Linear", description: "Create and triage issues from conversations.", category: "Productivity", icon: "linear", domain: "linear.app", authType: "OAuth2" },
  { slug: "hubspot", name: "HubSpot", description: "Look up contacts, log notes and move deals.", category: "CRM & Sales", icon: "hubspot", domain: "hubspot.com", authType: "OAuth2" },
  { slug: "salesforce", name: "Salesforce", description: "Sync leads, opportunities and activities.", category: "CRM & Sales", icon: "salesforce", domain: "salesforce.com", authType: "OAuth2" },
  { slug: "stripe", name: "Stripe", description: "Look up payments, customers and invoices.", category: "Payments", icon: "stripe", domain: "stripe.com", authType: "API Key" },
  { slug: "github", name: "GitHub", description: "Open PRs, read code and track issues.", category: "Developer", icon: "github", domain: "github.com", authType: "OAuth2" },
  { slug: "postgres", name: "Postgres", description: "Run safe, scoped queries against your database.", category: "Data", icon: "postgresql", domain: "postgresql.org", authType: "API Key" },
  { slug: "zendesk", name: "Zendesk", description: "Read tickets and draft replies for support agents.", category: "CRM & Sales", icon: "zendesk", domain: "zendesk.com", authType: "OAuth2" },
  { slug: "websearch", name: "Web Search", description: "Ground answers with live web results. No login needed.", category: "Data", icon: "google", domain: "google.com", authType: "None" },
];

/** Remote logo URL — no image files to download, served from CDN. */
export function toolLogoUrl(tool: Pick<CatalogTool, "icon">, color = "111111"): string {
  return `https://cdn.simpleicons.org/${tool.icon}/${color}`;
}
