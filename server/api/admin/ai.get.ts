import aiContentLog from "~~/data/ai-content-log.json";
import type { AdminAiStatus } from "~/utils/types/admin";

/**
 * There is no AI approval queue. `scripts/generate-ai-content.mjs` writes
 * straight to public/ai-content.json, so nothing is ever pending review — the
 * view says so rather than pretending to have a backlog.
 *
 * What we can report is the content-hash log the script keeps, which tells you
 * how much of the archive has generated content attached. The log records no
 * run timestamp, so `lastRun` stays null until one is added.
 */
export default defineEventHandler(async (event): Promise<AdminAiStatus> => {
  await requireAdmin(event);

  const hashes = (aiContentLog as { hashes?: Record<string, string> }).hashes ?? {};

  return {
    lastRun: null,
    entries: Object.keys(hashes).length,
    drafts: [],
  };
});
