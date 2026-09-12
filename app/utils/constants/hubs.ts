import type { Era, Region } from "./content";

export interface HubCopy {
  /** Page heading. */
  heading: string;
  /** Short label used in sibling-hub link lists and browse blocks. */
  label: string;
  /** Two or three sentences shown under the heading. */
  intro: string;
  /** Meta description, at most 155 characters. */
  description: string;
}

export const REGION_HUBS: Record<Region, HubCopy> = {
  "West Africa": {
    heading: "West African women who shaped history",
    label: "West Africa",
    intro:
      "From the market queens of the Niger Delta to the women who marched on colonial offices in Aba and Lagos, West Africa has never been short of women who refused to stay quiet. Some ruled kingdoms, some ran trade networks that stretched across borders, and some wrote the books that a generation of girls grew up on. These are their stories.",
    description:
      "Queens, market leaders, activists, and writers from Nigeria, Ghana, Senegal, Liberia, and across West Africa. Every profile in the HerStory Africa archive.",
  },
  "East Africa": {
    heading: "East African women who shaped history",
    label: "East Africa",
    intro:
      "Empresses in Ethiopia, freedom fighters in Kenya's forests, presidents in Tanzania, and a Nobel laureate who planted millions of trees. East Africa's women have led armies, built institutions, and changed the law from the inside. Meet the women from Ethiopia, Kenya, Uganda, Tanzania, Rwanda, Somalia, and beyond.",
    description:
      "Empresses, freedom fighters, presidents, and scientists from Ethiopia, Kenya, Uganda, Tanzania, Rwanda, and across East Africa, all in one place.",
  },
  "Southern Africa": {
    heading: "Southern African women who shaped history",
    label: "Southern Africa",
    intro:
      "Twenty thousand women marched on Pretoria in 1956 and told the apartheid government that when you strike a woman, you strike a rock. Southern Africa's women fought pass laws, led liberation movements, and then took seats in the parliaments they helped create. Their stories run from Zimbabwe's spirit mediums to South Africa's courtrooms.",
    description:
      "Anti-apartheid leaders, spirit mediums, judges, and heads of state from South Africa, Zimbabwe, Malawi, Mozambique, and across Southern Africa.",
  },
  "Central Africa": {
    heading: "Central African women who shaped history",
    label: "Central Africa",
    intro:
      "The first woman to serve as a prime minister anywhere in Africa did so in the Central African Republic in 1975. Central Africa's women have negotiated peace, led independence movements, and documented wartime abuses when nobody else would. Their names deserve to be better known.",
    description:
      "Prime ministers, peace negotiators, and independence leaders from the DRC, Cameroon, Congo, the Central African Republic, and across Central Africa.",
  },
  "North Africa": {
    heading: "North African women who shaped history",
    label: "North Africa",
    intro:
      "A pharaoh who ruled Egypt for two decades, a Berber queen who held back an invading army, and a doctor who wrote the book on women's bodies that her government tried to ban. North Africa's women have been rulers, rebels, and writers for three thousand years. Start here to meet them.",
    description:
      "Pharaohs, Berber queens, doctors, and activists from Egypt, Algeria, Morocco, Tunisia, and across North Africa. Three thousand years of women who led.",
  },
};

export const ERA_HUBS: Record<Era, HubCopy> = {
  "Pre-Colonial": {
    heading: "Women of pre-colonial Africa",
    label: "Pre-Colonial",
    intro:
      "Before European powers drew their lines on the map, African women ruled kingdoms, commanded armies, and controlled trade routes. Queens, warriors, and spiritual leaders whose authority nobody questioned. These profiles reach back to ancient Egypt, medieval Angola, and the Yoruba and Ashanti kingdoms.",
    description:
      "Queens, warriors, and spiritual leaders who ruled African kingdoms before colonial rule, from ancient Egypt to medieval Angola and the Yoruba kingdoms.",
  },
  "Colonial": {
    heading: "Women of the colonial era",
    label: "Colonial",
    intro:
      "Colonial rule stripped many African women of the political and economic standing they had held for generations. They did not accept it. The women in this era organised tax revolts, led armed resistance, founded schools, and wrote the first newspapers that told the truth about occupation.",
    description:
      "African women who resisted colonial rule: tax revolt leaders, armed fighters, school founders, and the first journalists to report on occupation.",
  },
  "Independence": {
    heading: "Women of Africa's independence era",
    label: "Independence",
    intro:
      "As one African country after another won its freedom from the late 1950s onward, women were on the front lines of every movement. They organised rallies, smuggled messages, and sat at negotiating tables. Then many of them watched the new governments forget their contribution. These are the women who made independence possible.",
    description:
      "The women who organised, marched, and negotiated Africa's independence movements from the 1950s onward, and what they built when the flags went up.",
  },
  "Modern": {
    heading: "Women of modern Africa",
    label: "Modern",
    intro:
      "The decades after independence brought military coups, structural adjustment, and the long fight against apartheid. The women of this era became judges, finance ministers, novelists, and heads of state. They built the institutions that a new generation now takes for granted.",
    description:
      "Judges, finance ministers, novelists, and heads of state who shaped Africa in the decades after independence and through the fight against apartheid.",
  },
  "Contemporary": {
    heading: "Contemporary African women making history",
    label: "Contemporary",
    intro:
      "History is still being written. The women in this collection are shaping Africa right now, in parliaments, courtrooms, laboratories, film studios, and on the world stage. Their stories are not finished, which makes them all the more worth following.",
    description:
      "African women shaping the continent right now, in parliaments, courtrooms, laboratories, and film studios. Profiles of leaders whose stories continue.",
  },
};

/**
 * Hand-written intros for the most common causes. Anything else falls back
 * to `causeIntro()` below.
 */
export const CAUSE_INTROS: Record<string, string> = {
  "Women's rights":
    "Nearly every woman in this archive fought for women's rights in some form, but for these women it was the whole point. They campaigned for the vote, for property and inheritance, for protection from violence, and for a seat at the table. Some won in their lifetimes. Others planted seeds that are still growing.",
  Education:
    "A girl who can read is harder to silence. The women here founded schools, taught in villages where no teacher had ever stayed, and argued in parliaments that a nation which does not educate its daughters is only half awake. Their classrooms produced the next generation of leaders.",
  "Women's leadership":
    "Being the first woman in the room is a lonely job. These women were the first to lead ministries, courts, universities, and countries, and they used the position to hold the door open for those who came after. Their stories show what leadership looks like when nobody has drawn the map for you.",
  "Human rights":
    "Some of these women were jailed for what they said. Others buried friends who had said the same thing. They documented abuses, defended prisoners, and refused to look away from the people their governments preferred to forget. Human rights in Africa has a long list of women who paid dearly for it.",
  "Sovereignty & independence":
    "Freedom did not arrive on its own. These women organised the boycotts, hid the fighters, raised the money, and stood in the crowds when the flags went up. Several of them led kingdoms that fought to stay free long before the word independence was in fashion.",
  "Political rights":
    "The right to vote, to stand for office, and to be heard by the people in power. The women here fought for all three, often at a time when the law said they were not entitled to any of them. Their victories changed constitutions.",
  "Political leadership":
    "Presidents, prime ministers, ministers, and parliamentarians. These women did not just enter politics; they ran it. Their careers show how much can change when a woman holds real power and how hard the resistance can be.",
  Democracy:
    "Elections are only as strong as the people willing to defend them. These women stood up to dictators, monitored ballots, and rebuilt civic institutions after years of one-party rule. Some of them paid with exile or prison. Their work is the reason many Africans can vote today.",
  "Anti-colonial activism":
    "Colonial governments feared organised women more than they ever admitted. The activists here led tax revolts, ran underground newspapers, and turned market associations into political movements. Their fight laid the groundwork for independence across the continent.",
  "Women's visibility":
    "You cannot become what you cannot see. These women put African women on television, on bookshelves, on concert stages, and in the record books. Every one of them made it a little easier for the next girl to imagine herself there too.",
};

/** Fallback intro for any cause without a hand-written one. */
export function causeIntro(cause: string, count: number): string {
  const label = cause.charAt(0).toLowerCase() + cause.slice(1);
  return `${count} women in the archive worked for ${label}. They came from different countries and different centuries, but each of them saw a wrong that others accepted and set out to change it. Read their stories to see how the same cause looked from very different lives.`;
}

/** Causes whose heading reads better as "African women in X" than "fought for X". */
const CAUSE_IN_HEADINGS: Record<string, string> = {
  "Arts & culture": "African women in arts and culture",
  Nollywood: "African women in Nollywood",
  Film: "African women in film",
  Music: "African women in music",
  Literature: "African women in literature",
  Science: "African women in the sciences",
  "Women in science": "African women in science",
  "Women in academia": "African women in academia",
  "Women in STEM": "African women in STEM",
  Leadership: "African women who led",
  "Military leadership": "African women who led armies",
  "Political leadership": "African women who led nations",
  "Spiritual leadership": "African women who led in faith",
  "Religious leadership": "African women who led congregations",
  "Women's leadership": "African women who led the way",
  "Women's political leadership": "African women who fought for women in power",
  "Women's political participation":
    "African women who fought for women in politics",
  "Women's economic empowerment":
    "African women who fought for economic empowerment",
  Representation: "African women who fought for representation",
  Governance: "African women who shaped governance",
  "Public health": "African women who built public health",
  Healthcare: "African women who built healthcare",
  "Diplomacy & military strategy": "African women in diplomacy and war",
  "Cultural preservation": "African women who preserved culture",
  "Cultural identity": "African women who defended cultural identity",
  "Cultural diplomacy": "African women in cultural diplomacy",
};

// Two causes sharing a heading would give their hub pages identical titles,
// which reads as duplicate content. Fail the build instead.
const headingsSeen = new Map<string, string>();
for (const [cause, heading] of Object.entries(CAUSE_IN_HEADINGS)) {
  const clash = headingsSeen.get(heading);
  if (clash) {
    throw new Error(
      `Duplicate hub heading "${heading}" for causes "${clash}" and "${cause}". Headings must be unique.`,
    );
  }
  headingsSeen.set(heading, cause);
}

/**
 * Causes that open with a proper noun keep their capital letter when they
 * fall mid-sentence in a heading ("fought for Pan-Africanism").
 */
const PROPER_NOUN_CAUSES = new Set([
  "Nollywood",
  "Pan-Africanism",
  "Northern Nigeria women's rights",
]);

/** The raw cause as it should read mid-sentence: "women's rights", "STEM", "Nollywood". */
function causeInSentence(cause: string): string {
  const firstWord = cause.split(/\s/)[0] ?? "";
  const isAcronym = firstWord.length > 1 && firstWord === firstWord.toUpperCase();
  if (PROPER_NOUN_CAUSES.has(cause) || isAcronym) return cause;
  return cause.charAt(0).toLowerCase() + cause.slice(1);
}

/**
 * Sentence-case hub heading for a cause. The second argument is kept so
 * existing call sites that pass a title-cased label still compile; the
 * heading itself is built from the raw cause.
 */
export function causeHeading(cause: string, _titleCased?: string): string {
  return (
    CAUSE_IN_HEADINGS[cause] ?? `African women who fought for ${causeInSentence(cause)}`
  );
}

export const SITE_NAME = "HerStory Africa";
const TITLE_MAX = 60;

/**
 * `${base} | HerStory Africa` when that fits in 60 characters, otherwise the
 * base alone (clipped at a word boundary if it is itself too long).
 */
export function hubTitle(base: string): string {
  const full = `${base} | ${SITE_NAME}`;
  if (full.length <= TITLE_MAX) return full;
  if (base.length <= TITLE_MAX) return base;
  const window = base.slice(0, TITLE_MAX + 1);
  const cut = window.lastIndexOf(" ");
  return (cut > 0 ? window.slice(0, cut) : base.slice(0, TITLE_MAX)).replace(
    /[\s,:;]+$/,
    "",
  );
}

/**
 * Editorial picks shown at the top of each region and era hub. Exactly three
 * slugs per key: the first is the large feature card, the next two are the
 * small cards beside it. Every slug must be a profile in that region or era
 * with a real portrait (not placeholder.svg). Editors may change these freely;
 * nothing else depends on the choice.
 */
export const HUB_FEATURED: {
  region: Record<Region, string[]>;
  era: Record<Era, string[]>;
} = {
  region: {
    "West Africa": [
      "funmilayo-ransome-kuti",
      "yaa-asantewaa",
      "ngozi-okonjo-iweala",
    ],
    "East Africa": ["wangari-maathai", "taytu-betul", "vanessa-nakate"],
    "Southern Africa": [
      "winnie-madikizela-mandela",
      "charlotte-maxeke",
      "graca-machel",
    ],
    "Central Africa": ["nzinga-ndongo-matamba", "kimpa-vita", "andree-blouin"],
    "North Africa": ["hatshepsut", "nawal-el-saadawi", "huda-shaarawi"],
  },
  era: {
    "Pre-Colonial": ["amina-of-zazzau", "queen-idia", "dihya"],
    Colonial: ["lilian-ngoyi", "yaa-asantewaa", "huda-shaarawi"],
    Independence: ["djamila-bouhired", "mariama-ba", "flora-nwapa"],
    Modern: ["ellen-johnson-sirleaf", "wangari-maathai", "dora-akunyili"],
    Contemporary: [
      "chimamanda-ngozi-adichie",
      "joyce-banda",
      "amina-j-mohammed",
    ],
  },
};
