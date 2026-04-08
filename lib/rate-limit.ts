const hits = new Map<string, { count: number; expiresAt: number }>();

export function isRateLimited(key: string, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const current = hits.get(key);

  if (!current || current.expiresAt < now) {
    hits.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  current.count += 1;
  hits.set(key, current);
  return current.count > max;
}
