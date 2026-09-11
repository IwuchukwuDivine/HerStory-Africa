import { REGIONS, ERAS } from "~/utils/constants/content";

/**
 * Counts every page needs for its copy ("197 women", "93 women in West
 * Africa", "33 articles"). One cheap select over the women collection and one
 * count over articles, cached under a shared key.
 */
export default async function useArchiveCounts() {
  const { data } = await useAsyncData("archive-counts", async () => {
    const [women, articles] = await Promise.all([
      queryCollection("women").select("slug", "region", "era", "country").all(),
      queryCollection("articles").select("slug").all(),
    ]);
    const byRegion: Record<string, number> = {};
    const byEra: Record<string, number> = {};
    const countries = new Set<string>();
    for (const w of women) {
      byRegion[w.region] = (byRegion[w.region] ?? 0) + 1;
      byEra[w.era] = (byEra[w.era] ?? 0) + 1;
      countries.add(w.country);
    }
    return {
      women: women.length,
      articles: articles.length,
      countries: countries.size,
      byRegion,
      byEra,
    };
  });

  const counts = computed(() => data.value ?? { women: 0, articles: 0, countries: 0, byRegion: {}, byEra: {} });
  const regionRows = computed(() =>
    REGIONS.map((r) => ({ label: r, count: counts.value.byRegion[r] ?? 0, to: `/women/region/${slugify(r)}` })),
  );
  const eraRows = computed(() =>
    ERAS.map((e) => ({ label: e, count: counts.value.byEra[e] ?? 0, to: `/women/era/${slugify(e)}` })),
  );

  return { counts, regionRows, eraRows };
}
