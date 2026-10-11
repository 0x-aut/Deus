import { Composio } from "@composio/core";

let client: Composio | null = null;

/** API key comes from the environment — the only thing the user must add. */
export function composioApiKey(): string {
  return process.env.COMPOSIO_API_KEY ?? process.env.NUXT_COMPOSIO_API_KEY ?? "";
}

export function isComposioConfigured(): boolean {
  return composioApiKey().length > 0;
}

export function getComposio(): Composio {
  if (!isComposioConfigured()) {
    throw new Error(
      "Composio is not configured. Add COMPOSIO_API_KEY to your .env and restart the server.",
    );
  }
  if (!client) {
    client = new Composio({ apiKey: composioApiKey() });
  }
  return client;
}
