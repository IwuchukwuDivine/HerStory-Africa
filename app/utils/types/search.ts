export type ArchiveSearchResultType = "woman" | "article" | "opportunity";

export interface SnippetPart {
  text: string;
  match: boolean;
}

export interface ArchiveSearchResult {
  type: ArchiveSearchResultType;
  slug: string;
  title: string;
  subtitle?: string;
  /** Portrait path for women results (may be the grey placeholder). */
  image?: string;
  to: string;
  score: number;
  snippet?: SnippetPart[];
}
