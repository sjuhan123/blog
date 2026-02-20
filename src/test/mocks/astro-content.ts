// Mock for astro:content — only types are needed at runtime
export type CollectionEntry<_T extends string> = {
  data: Record<string, unknown>;
};
