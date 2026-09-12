/**
 * Build-time snapshot of the Markdown archive, emitted by the `nitro.virtual`
 * entry in nuxt.config.ts. The admin console reads the content from here
 * rather than through `queryCollection`, whose database is not available
 * inside the deployed function.
 */
declare module "herstory-content-snapshot" {
  export interface WomanSnapshot {
    slug: string;
    name: string;
    region: string;
    /** ISO date, "" when the frontmatter omits it. */
    dateAdded: string;
    wordCount: number;
    sourceCount: number;
    /** False when the profile is still on the shared placeholder. */
    hasPortrait: boolean;
    /** Word-count thresholds, carried so the bands live in one place. */
    stubWords: number;
    shortWords: number;
  }

  export interface ArticleSnapshot {
    slug: string;
    date: string;
  }

  export interface OpportunitySnapshot {
    slug: string;
    title: string;
    organization: string;
    category: string;
    deadline: string | null;
  }

  const snapshot: {
    women: WomanSnapshot[];
    articles: ArticleSnapshot[];
    opportunities: OpportunitySnapshot[];
  };

  export default snapshot;
}
