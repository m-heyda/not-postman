# Echo GET Params

Sends query parameters to httpbin and receives them back in the response.

## Endpoint

```
GET {{httpbinBaseUrl}}/get?foo=bar&debug=true
```

## Response

httpbin echoes your request details including:
- `args` — query parameters as key-value pairs
- `headers` — request headers
- `url` — the full URL that was called

Useful for verifying that the params UI is building the correct request.
