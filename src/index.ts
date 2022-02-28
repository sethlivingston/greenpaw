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
  json?: any | null;
  text?: string | null;
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

/**
 * Union of the three possible error types.
 */
export type RequestError = NetworkError | HttpError | PostProcessingError;

/**
 * Wraps the Fetch API response object with processed JSON or text content
 * depending on the response's content type and body.
 */
export interface ProcessedResponse {
  resp: Response;
  json?: any | null;
  text?: string | null;
}

/**
 * Wraps the [standard fetch
 * function](developer.mozilla.org/en-US/docs/Web/API/fetch). Returns a
 * `[ProcessedResponse, RequestError]` tuple. Does not throw any exceptions.
 */
export async function request(
  input: RequestInfo,
  init?: RequestInit
): Promise<[ProcessedResponse | null, RequestError | null]> {
  let resp: Response | null = null;

  try {
    // Make the request
    resp = await fetch(input, init);
  } catch (err) {
    // Network error
    return [null, { type: "network" }];
  }

  // Read the response body if it's JSON or text
  let json, text, readErr;
  if (hasContent(resp)) {
    const contentType = (resp.headers.get("content-type") || "").toLowerCase();
    if (isJSON(contentType)) {
      [json, readErr] = await readJSON(resp);
    } else if (isText(contentType)) {
      [text, readErr] = await readText(resp);
    }
  }

  // Check for HTTP error
  if (!resp.ok) {
    return [null, { type: "http", resp, json, text }];
  }

  // Check for post-processing error
  if (readErr) {
    return [null, { type: "post", resp, error: readErr }];
  }

  // Everything went fine
  return [{ resp, json, text }, null];
}

export async function readJSON(
  resp: Response
): Promise<[any | null, Error | null]> {
  try {
    const content = await resp.json();
    return [content, null];
  } catch (err) {
    return [null, err as Error];
  }
}

export async function readText(
  resp: Response
): Promise<[string | null, Error | null]> {
  try {
    const content = await resp.text();
    return [content, null];
  } catch (err) {
    return [null, err as Error];
  }
}

export async function readBlob(
  resp: Response
): Promise<[Blob | null, Error | null]> {
  try {
    const content = await resp.blob();
    return [content, null];
  } catch (err) {
    return [null, err as Error];
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
