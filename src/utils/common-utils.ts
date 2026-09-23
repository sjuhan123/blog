export function slugify(input?: string) {
  if (!input) return '';

  // make lower case and trim
  var slug = input.toLowerCase().trim();

  // remove accents from charaters
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // replace invalid chars with spaces
  slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();

  // replace multiple spaces or hyphens with a single hyphen
  slug = slug.replace(/[\s-]+/g, '-');

  // non-Latin scripts (e.g. Korean) get fully stripped by the rules above,
  // collapsing every such tag to the same empty slug. Fall back to the
  // original text (Astro encodes the URI itself when routing/building) so
  // distinct tags don't collide.
  if (!slug) {
    return input.trim().replace(/\s+/g, '-');
  }

  return slug;
}
