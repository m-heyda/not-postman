# Random Fact

Returns a single random cat fact.

## Endpoint

```
GET {{meowfactsBaseUrl}}/
```

## Example Response

```json
{
  "data": [
    "Mother cats teach their kittens to use the litter box."
  ]
}
```

## Notes

No authentication required. Response always contains a `data` array with one fact string.
