// Only an explicit token rejection can invalidate the saved session. Native
// storage errors, malformed responses, timeouts and server errors are retryable.
export function isRefreshTokenRejected(status: number | undefined, data: unknown): boolean {
  if (status === 401) return true;
  if (status !== 400 && status !== 403) return false;
  if (!data || typeof data !== "object") return false;
  const body = data as { code?: unknown; error_code?: unknown; data?: unknown };
  const code = body.code ?? body.error_code;
  return code === "token_not_valid" || code === "invalid_token" || code === "TOKEN_REVOKED"
    || (body.data !== data && isRefreshTokenRejected(status, body.data));
}
