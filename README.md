# Greenpaw HTTP Client

Greenpaw is the JavaScript [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
with [Go-style error handling](https://go.dev/blog/error-handling-and-go).

## Features

- Zero dependencies
- Thin wrapper around the standard Fetch API
- No exceptions &mdash; functions return a tuple with a result and an error
- Easily discern between network exceptions, HTTP error responses, and post-processing exceptions
- Effortless JSON, HTML, XML, and plain text response handling
- Runs in all modern browsers and Node.js<sup>\*</sup>

<sup>\*</sup> <small>Node.js 17.6+ with experimental Fetch API enabled or prior
versions with a Fetch-compatible library.</small>

## Installing and importing

Using npm:

```shell
$ npm install greenpaw
```

Importing:

```typescript
import { request } from "greenpaw";
```

Hosted:

`TBD`

## Usage

- [Making requests](#making-requests)
- [Handling errors](#handling-errors)
- [Reading responses](#reading-responses)
- [Reading HTTP error responses](#reading-http-error-responses)

### Making requests

The `greenpaw.request` method accepts the same parameters as the [standard fetch
function](https://developer.mozilla.org/en-US/docs/Web/API/fetch). Instead of
returning a response or possibly throwing an exception, it returns a Go-style
tuple `[greenpaw.Response, greenpaw.Error]`.

```typescript
// Make the request
const [resp, err] = await request("https://httpbin.org/json");
if (err) {
  // Handle the error
  return;
}

// Proceed as planned
console.log(resp.json);
```

### Handling errors

None of the greenpaw functions throw exceptions when something goes wrong.
Instead, they return a robust error object in the second element of the tuple,
`greenpaw.RequestError`. The object is a [Typescript discriminated
union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
of three different types of errors.

```typescript
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
```

Here's how you can handle errors.

```typescript
function handleError(err: RequestError) {
  switch (err.type) {
    case "network":
      console.error("Network error");
      break;
    case "http":
      console.error("HTTP error:", err.resp.statusCode);
      break;
    case "post":
      console.error("Post-processing error:", err.error.message);
      break;
  }
}

// Make the request
const [resp, err] = await request("https://httpbin.org/json");
if (err) {
  handleError(err);
  return;
}

// Proceed as planned
console.log(resp.json);
```

### Reading responses

Greenpaw automatically reads response bodies **on successful requests** if they
are JSON or text. There is no need to call `Response.json()` or
`Response.text()` as you normally would with the Fetch API.

The first element of the tuple returned by Greenpaw functions is a
`greenpaw.ProcessedResponse` object.

```typescript
/**
 * Wraps the Fetch API response object with processed JSON or text content
 * depending on the response's content type and body.
 */
export interface ProcessedResponse {
  resp: Response;
  json?: any;
  text?: string;
}
```

The examples above demonstrate how to read JSON content. Here's how to read
text content, such as HTML and XML.

```typescript
// Make the request
const [resp, err] = await request("https://httpbin.org/html"); // <-- Note the URL
if (err) {
  handleError(err);
  return;
}

// Proceed as planned
console.log(resp.text);
```

### Reading HTTP error responses

Sometimes HTTP error responses include JSON or text bodies. For example, a
[422 Unprocessable Entity](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422)
might include a JSON response body with information the client can use to
resolve the problem.

Greenpaw will not automatically read response bodies on HTTP errors, but you
can read them using one of the provided Go-style utility functions.

- `readJSON(resp: Response): Promise<[any, Error]>`
- `readText(resp: Response): Promise<[string, Error]>`
- `readBlob(resp: Response): Promise<[Blob, Error]>`

Here's an example.

```typescript
function async handle422Error(err: RequestError) {
  if (err.type === "http" && err.resp.statusCode === 422) {
    const [content, readError] = await readJSON(err.resp);
    if (readError) {
      // Unable to read and parse the JSON
    }
    console.error("422 response body:", content);
  }
}

// This URL actually returns an empty body, but let's assume it has some JSON
// content for demonstration purposes
const [resp, err] = await request("https://httpbin.org/status/422");
if (err) {
  await handle422Error(err);
  return;
}
```

Unlike `Response.json()` and `Response.text()`, these utility functions will
never throw exceptions.

## API

## LICENSE

MIT

## Contributing

Yes, please!

Be sure to create an issue before you submit a change request.

```

```
