/**
 * Returns the public URL for a given path, taking into account
 * the base URL configured in vite.config.ts.
 */
export function publicUrl(path: string): string {
  return new URL(path, import.meta.url).href;
}
