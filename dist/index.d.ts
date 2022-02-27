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
export declare type RequestError = NetworkError | HttpError | PostProcessingError;
/**
 * Wraps the Fetch API response object with processed JSON or text content
 * depending on the response's content type and body.
 */
export interface ProcessedResponse {
    resp: Response;
    json?: any;
    text?: string;
}
export declare function get<T = any>(input: Request | string, init?: RequestInit): Promise<[T | undefined, RequestError | null]>;
export declare function request<T = any>(input: RequestInfo, init?: RequestInit): Promise<[T | undefined, RequestError | null]>;
export declare function readBody(resp: Response): Promise<[any | undefined, Error | null]>;
export declare function readJSON<T = any>(resp: Response): Promise<[T | undefined, Error | null]>;
export declare function readText(resp: Response): Promise<[string | undefined, Error | null]>;
export declare function readBlob(resp: Response): Promise<[Blob | undefined, Error | null]>;
export {};
//# sourceMappingURL=index.d.ts.map