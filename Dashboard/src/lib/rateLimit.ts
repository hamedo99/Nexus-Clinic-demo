// SECURITY FIX: Simple in-memory rate limiting mechanism (HIGH #4)
export const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function isRateLimited(ip: string, maxRequests: number = 20, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}
