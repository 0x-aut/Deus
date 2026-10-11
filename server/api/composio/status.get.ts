import { isComposioConfigured } from "../../utils/composio";

export default defineEventHandler(() => {
  return { configured: isComposioConfigured() };
});
