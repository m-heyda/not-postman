# Fact by ID

Returns a specific cat fact by its numeric ID.

## Endpoint

```
GET {{meowfactsBaseUrl}}/?id=3
```

## Parameters

| Param | Type   | Description          |
|-------|--------|----------------------|
| id    | number | Fact ID (1-indexed)  |

## Notes

IDs are stable across requests. Useful for bookmarking a favorite fact.
