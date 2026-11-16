// Renders scripts/og/links-card.html to public/og/links.png (1200x630) with
// the locally installed Google Chrome. See the comment in the HTML file.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const html = resolve(here, "links-card.html");
const out = resolve(root, "public/og/links.png");

if (!existsSync(resolve(root, ".output/public/_fonts"))) {
  console.error("Run `npm run generate` first: the card uses the fonts it self-hosts.");
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

mkdirSync(dirname(out), { recursive: true });
execFileSync(chrome, [
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--allow-file-access-from-files",
  "--virtual-time-budget=3000",
  "--window-size=1200,630",
  `--screenshot=${out}`,
  pathToFileURL(html).href,
]);
console.log(`Wrote ${out}`);
