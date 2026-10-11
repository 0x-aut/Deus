import { getComposio, isComposioConfigured } from "../../utils/composio";

export default defineEventHandler(async (event) => {
  if (!isComposioConfigured()) {
    throw createError({
      statusCode: 409,
      message: "Add COMPOSIO_API_KEY to your .env to enable live connect.",
    });
  }
  const body = await readBody<{ toolkit?: string; callbackUrl?: string }>(event);
  const toolkit = body?.toolkit?.trim();
  if (!toolkit) {
    throw createError({ statusCode: 400, message: "Missing toolkit slug." });
  }
  try {
    const composio = getComposio();
    const request = await composio.toolkits.authorize(toolkit, {
      callbackUrl:
        body?.callbackUrl ??
        `${getRequestURL(event).origin}/${event.context.params?.username ?? ""}/manage/tools`,
    });
    return {
      toolkit,
      redirectUrl: (request as { redirectUrl?: string }).redirectUrl ?? null,
      status: (request as { status?: string }).status ?? "initiated",
    };
  } catch (error) {
    throw createError({
      statusCode: 502,
      message: error instanceof Error ? error.message : `Failed to connect ${toolkit}.`,
    });
  }
});
