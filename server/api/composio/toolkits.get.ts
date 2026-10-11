import { getComposio, isComposioConfigured } from "../../utils/composio";

export default defineEventHandler(async () => {
  if (!isComposioConfigured()) {
    return { configured: false, toolkits: [] as unknown[] };
  }
  try {
    const composio = getComposio();
    const toolkits = await composio.toolkits.get();
    return { configured: true, toolkits };
  } catch (error) {
    throw createError({
      statusCode: 502,
      message: error instanceof Error ? error.message : "Failed to list Composio toolkits.",
    });
  }
});
