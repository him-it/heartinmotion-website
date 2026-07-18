/** Converts a display name into a URL-safe, lowercase, hyphenated slug. */
export const slugify = (name: string): string =>
    name
        .toLocaleLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
