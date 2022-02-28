var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Wraps the [standard fetch
 * function](developer.mozilla.org/en-US/docs/Web/API/fetch). Returns a
 * `[ProcessedResponse, RequestError]` tuple. Does not throw any exceptions.
 */
export function request(input, init) {
    return __awaiter(this, void 0, void 0, function* () {
        let resp = null;
        try {
            // Make the request
            resp = yield fetch(input, init);
        }
        catch (err) {
            // Network error
            return [null, { type: "network" }];
        }
        // Read the response body if it's JSON or text
        let json, text, readErr;
        if (hasContent(resp)) {
            const contentType = (resp.headers.get("content-type") || "").toLowerCase();
            if (isJSON(contentType)) {
                [json, readErr] = yield readJSON(resp);
            }
            else if (isText(contentType)) {
                [text, readErr] = yield readText(resp);
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
    });
}
export function readJSON(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield resp.json();
            return [content, null];
        }
        catch (err) {
            return [null, err];
        }
    });
}
export function readText(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield resp.text();
            return [content, null];
        }
        catch (err) {
            return [null, err];
        }
    });
}
export function readBlob(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield resp.blob();
            return [content, null];
        }
        catch (err) {
            return [null, err];
        }
    });
}
function isJSON(contentType) {
    return contentType.startsWith("application/json");
}
function isText(contentType) {
    return (contentType.startsWith("text/") || contentType.startsWith("application/xml"));
}
function hasContent(resp) {
    return +(resp.headers.get("content-length") || "0") > 0;
}
//# sourceMappingURL=index.js.map