interface ConnectResult {
  toolkit: string;
  redirectUrl: string | null;
  status: string;
}

/**
 * Client wrapper around the Composio server routes.
 * When no API key is configured the server answers 409 / { configured: false }
 * and the UI falls back to the curated catalog + local pending state —
 * so the only thing left to do is add the keys.
 */
export function useComposio() {
  const configured = useState<boolean>("composio:configured", () => false);
  const connecting = ref<string | null>(null);
  const notice = ref<string | null>(null);

  async function refreshStatus() {
    try {
      const res = await $fetch<{ configured: boolean }>("/api/composio/status");
      configured.value = res.configured;
    } catch {
      configured.value = false;
    }
  }

  async function connect(toolkit: string): Promise<ConnectResult | null> {
    connecting.value = toolkit;
    notice.value = null;
    try {
      const res = await $fetch<ConnectResult>("/api/composio/connect", {
        method: "POST",
        body: { toolkit },
      });
      if (res.redirectUrl && import.meta.client) {
        window.open(res.redirectUrl, "_blank", "noopener");
        notice.value = `Finish connecting ${toolkit} in the opened tab, then it will show as connected.`;
      }
      return res;
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        (error instanceof Error ? error.message : "Could not start the Composio connect flow.");
      notice.value = message;
      return null;
    } finally {
      connecting.value = null;
    }
  }

  if (import.meta.client) {
    refreshStatus();
  }

  return { configured, connecting, notice, refreshStatus, connect };
}
