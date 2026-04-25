import type { NextRequest } from "next/server"

export type SupportedBlockchain = "ethereum" | "solana" | "abstract" | "apechain"

const SUPPORTED_BLOCKCHAINS: SupportedBlockchain[] = ["ethereum", "solana", "abstract", "apechain"]

const WALLET_PATTERNS: Record<SupportedBlockchain, RegExp> = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  abstract: /^0x[a-fA-F0-9]{40}$/,
  apechain: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}

type RateLimitBucket = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitBucket>()

export function isSupportedBlockchain(value: unknown): value is SupportedBlockchain {
  return typeof value === "string" && SUPPORTED_BLOCKCHAINS.includes(value as SupportedBlockchain)
}

export function normalizeWalletAddress(address: string, blockchain: SupportedBlockchain): string {
  const trimmed = address.trim()
  if (blockchain === "solana") {
    return trimmed
  }
  return trimmed.toLowerCase()
}

export function isValidWalletAddress(address: string, blockchain: SupportedBlockchain): boolean {
  return WALLET_PATTERNS[blockchain].test(address.trim())
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

export function consumeRateLimit(
  request: NextRequest,
  routeKey: string,
  maxRequests: number,
  windowMs: number,
): {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
} {
  const now = Date.now()
  const ip = getClientIp(request)
  const key = `${routeKey}:${ip}`
  const existing = rateLimitStore.get(key)

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  rateLimitStore.set(key, existing)

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  }
}

