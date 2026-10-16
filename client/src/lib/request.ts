export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`Request failed with status ${status}`);
    this.name = "HttpError";
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

export const request = (input: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () =>
      controller.abort(new DOMException("Request timed out", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  );

  return fetch(input, { ...init, signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new HttpError(res.status);
      return res;
    })
    .finally(() => clearTimeout(timeout));
};
