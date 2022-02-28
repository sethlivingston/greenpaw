/**
 * The request wasn't able to reach the server. This can happen when the app is
 * offline or there are other downstream connection issues.
 */
declare type NetworkError = {
    type: "network";
};
/**
 * The request reached the server, but the server returned a status code outside
 * of the range [200, 400).
 */
declare type HttpError = {
    type: "http";
    resp: Response;
    json?: any | null;
    text?: string | null;
};
/**
 * The request reached the server, the server returned a successful status code,
 * but an error occurred while parsing the JSON or text response body.
 */
declare type PostProcessingError = {
    type: "post";
    error: Error;
    resp: Response;
};
/**
 * Union of the three possible error types.
 */
export declare type RequestError = NetworkError | HttpError | PostProcessingError;
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
export declare function request(input: RequestInfo, init?: RequestInit): Promise<[ProcessedResponse | null, RequestError | null]>;
export declare function readJSON(resp: Response): Promise<[any | null, Error | null]>;
export declare function readText(resp: Response): Promise<[string | null, Error | null]>;
export declare function readBlob(resp: Response): Promise<[Blob | null, Error | null]>;
export {};
//# sourceMappingURL=index.d.ts.map