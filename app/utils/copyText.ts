/**
 * Copy text to the clipboard. A tap inside a bottom sheet often makes
 * `navigator.clipboard.writeText` hang or reject (Safari), so we try a
 * synchronous `execCommand` first while the user gesture is still live.
 */
export default async (text: string): Promise<boolean> => {
  if (!import.meta.client) return false;

  if (legacyCopy(text)) return true;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

function legacyCopy(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.setAttribute("aria-hidden", "true");
    // iOS ignores execCommand on nodes parked off-screen (`left: -9999px`).
    el.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
