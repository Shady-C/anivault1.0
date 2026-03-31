export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  delayMs: 500,
  backoffMultiplier: 2,
  timeout: 30000,
};

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = "RetryError";
  }
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      try {
        const result = await fn();
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (lastError.message.includes("404") || lastError.message.includes("401") || lastError.message.includes("403")) {
        throw lastError;
      }

      if (attempt > config.maxRetries) {
        throw new RetryError(`Failed after ${attempt} attempts: ${lastError.message}`, lastError, attempt);
      }

      const isRateLimit = lastError.message.includes("429") || lastError.message.toLowerCase().includes("too many requests");
      const waitMs = isRateLimit ? 2000 : delay;

      if (process.env.NODE_ENV === "development") {
        console.warn(`[Retry ${attempt}/${config.maxRetries}] ${isRateLimit ? "Rate limited —" : ""} retrying in ${waitMs}ms`);
      }

      await new Promise(resolve => setTimeout(resolve, waitMs));
      if (!isRateLimit) delay *= config.backoffMultiplier;
    }
  }

  throw new RetryError(
    `Failed after ${config.maxRetries + 1} attempts`,
    lastError || new Error("Unknown error"),
    config.maxRetries + 1
  );
}

export function withRetry<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options?: RetryOptions
): (...args: Args) => Promise<T> {
  return (...args: Args) => retryWithBackoff(() => fn(...args), options);
}
