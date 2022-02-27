/**
 * The request wasn't able to reach the server. This can happen when the app is
 * offline or there are other downstream connection issues.
 */
type NetworkError = {
  type: "network";
};

/**
 * The request reached the server, but the server returned a status code outside
 * of the range [200, 400).
 */
type HttpError = {
  type: "http";
  resp: Response;
};

/**
 * The request reached the server, the server returned a successful status code,
 * but an error occurred while parsing the JSON or text response body.
 */
type PostProcessingError = {
  type: "post";
  error: Error;
  resp: Response;
};

export type RequestError = NetworkError | HttpError | PostProcessingError;

/**
 * Wraps the Fetch API response object with processed JSON or text content
 * depending on the response's content type and body.
 */
export interface ProcessedResponse {
  resp: Response;
  json?: any;
  text?: string;
}

export function get<T = any>(
  input: Request | string,
  init?: RequestInit
): Promise<[T | undefined, RequestError | null]> {
  return request(input, {
    ...init,
    method: "GET",
  });
}

export async function request<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<[T | undefined, RequestError | null]> {
  let resp: Response | null = null;

  try {
    // Make the request
    resp = await fetch(input, init);
  } catch (err) {
    // Network error
    return [undefined, { type: "network" }];
  }

  if (!resp.ok) {
    // HTTP error
    return [undefined, { type: "http", resp }];
  }

  const [content, err] = await readBody(resp);
  if (err) {
    // Post-processing error
    return [undefined, { type: "post", resp, error: err }];
  }

  // Everything went fine
  return [content, null];
}

export async function readBody(
  resp: Response
): Promise<[any | undefined, Error | null]> {
  const contentType = resp.headers.get("content-type") || "";
  if (isJSON(contentType)) {
    return readJSON(resp);
  } else if (isText(contentType)) {
    return readText(resp);
  } else {
    return readBlob(resp);
  }
}

export async function readJSON<T = any>(
  resp: Response
): Promise<[T | undefined, Error | null]> {
  try {
    const content = await resp.json();
    return [content, null];
  } catch (err) {
    return [undefined, err as Error];
  }
}

export async function readText(
  resp: Response
): Promise<[string | undefined, Error | null]> {
  try {
    const content = await resp.text();
    return [content, null];
  } catch (err) {
    return [undefined, err as Error];
  }
}

export async function readBlob(
  resp: Response
): Promise<[Blob | undefined, Error | null]> {
  try {
    const content = await resp.blob();
    return [content, null];
  } catch (err) {
    return [undefined, err as Error];
  }
}

function isJSON(contentType: string): boolean {
  return contentType.startsWith("application/json");
}

function isText(contentType: string): boolean {
  return (
    contentType.startsWith("text/") || contentType.startsWith("application/xml")
  );
}

function hasContent(resp: Response): boolean {
  return +(resp.headers.get("content-length") || "0") > 0;
}
