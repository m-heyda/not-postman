const PREFIX = "not-postman:local";

function buildKey(
  requestPath: string,
  section: string,
  key: string,
): string {
  return `${PREFIX}:${requestPath}:${section}:${key}`;
}

export function getLocalValue(
  requestPath: string,
  section: string,
  key: string,
): string | null {
  try {
    return localStorage.getItem(buildKey(requestPath, section, key));
  } catch {
    return null;
  }
}

export function setLocalValue(
  requestPath: string,
  section: string,
  key: string,
  value: string,
): void {
  try {
    localStorage.setItem(buildKey(requestPath, section, key), value);
  } catch {
    // localStorage may be full or unavailable
  }
}

export function removeLocalValue(
  requestPath: string,
  section: string,
  key: string,
): void {
  try {
    localStorage.removeItem(buildKey(requestPath, section, key));
  } catch {
    // ignore
  }
}
