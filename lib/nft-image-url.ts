export function normalizeNftImageUrl(rawUrl: string): string {
  const value = rawUrl.trim()
  if (!value) return "/placeholder.svg"

  if (value.startsWith("ipfs://")) {
    const cidPath = value.replace("ipfs://", "")
    return `https://ipfs.io/ipfs/${cidPath}`
  }

  return value
}

export function getProxiedNftImageUrl(rawUrl: string): string {
  const normalized = normalizeNftImageUrl(rawUrl)

  // Local placeholders/assets should not be proxied.
  if (normalized.startsWith("/")) {
    return normalized
  }

  if (normalized.startsWith("blob:") || normalized.startsWith("data:")) {
    return normalized
  }

  return `/api/image-proxy?url=${encodeURIComponent(normalized)}`
}

