import { getBackendApiBase } from "@/lib/api/config";

export class BackendApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

type BackendFetchOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
  headers?: HeadersInit;
};

/**
 * Chamada server-to-server para a API Adonis (BFF → backend).
 */
export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, accessToken, headers } = options;
  const url = `${getBackendApiBase()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-client-type": "web",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Erro na API (${response.status})`;

    throw new BackendApiError(message, response.status, payload);
  }

  return payload as T;
}
