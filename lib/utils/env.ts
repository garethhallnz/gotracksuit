import { BaseUrl, Port } from "./parsers.ts";

export const readServerPort = (): number =>
  Port.parse(Deno.env.get("SERVER_PORT"));

export const readClientPort = (): number =>
  Port.parse(Deno.env.get("CLIENT_PORT"));

export const readServerBaseUrl = (): string =>
  BaseUrl.parse(Deno.env.get("SERVER_BASE_URL"));
