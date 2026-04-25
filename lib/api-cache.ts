type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const apiCache = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key)
  if (!entry) return null

  if (Date.now() >= entry.expiresAt) {
    apiCache.delete(key)
    return null
  }

  return entry.value as T
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  apiCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

export function buildCacheKey(prefix: string, parts: Array<string | number | undefined | null>): string {
  return `${prefix}:${parts.map((part) => String(part ?? "")).join(":")}`
}

