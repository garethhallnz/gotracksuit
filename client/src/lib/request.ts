export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`Request failed with status ${status}`);
    this.name = "HttpError";
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

export const request = (input: string, init?: RequestInit) =>
  fetch(input, init).then((res) => {
    if (!res.ok) throw new HttpError(res.status);
    return res;
  });
