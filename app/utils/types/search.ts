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
  to: string;
  score: number;
  snippet?: SnippetPart[];
}
