/**
 * Reads the selected request path from the URL hash.
 * Format: #/collection/request-slug.yaml
 */
export function getRequestPathFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash || hash === "#") return null;
  // Strip the leading #/ or #
  const path = hash.startsWith("#/") ? hash.slice(2) : hash.slice(1);
  return path || null;
}

/**
 * Sets the selected request path in the URL hash without triggering navigation.
 */
export function setRequestPathInHash(requestPath: string | null): void {
  if (!requestPath) {
    history.replaceState(null, "", window.location.pathname);
    return;
  }
  history.replaceState(null, "", `#/${requestPath}`);
}
