var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function get(input, init) {
    return request(input, Object.assign(Object.assign({}, init), { method: "GET" }));
}
export function request(input, init) {
    return __awaiter(this, void 0, void 0, function* () {
        let resp = null;
        try {
            // Make the request
            resp = yield fetch(input, init);
        }
        catch (err) {
            // Network error
            return [undefined, { type: "network" }];
        }
        if (!resp.ok) {
            // HTTP error
            return [undefined, { type: "http", resp }];
        }
        const [content, err] = yield readBody(resp);
        if (err) {
            // Post-processing error
            return [undefined, { type: "post", resp, error: err }];
        }
        // Everything went fine
        return [content, null];
    });
}
export function readBody(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentType = resp.headers.get("content-type") || "";
        if (isJSON(contentType)) {
            return readJSON(resp);
        }
        else if (isText(contentType)) {
            return readText(resp);
        }
        else {
            return readBlob(resp);
        }
    });
}
export function readJSON(resp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield resp.json();
            return [content, null];
        }
        catch (err) {
            return [undefined, err];
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
            return [undefined, err];
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
            return [undefined, err];
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