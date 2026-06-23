# Multiple Facts

Returns multiple random cat facts in a single response.

## Endpoint

```
GET {{meowfactsBaseUrl}}/?count=3
```

## Parameters

| Param | Type   | Description              |
|-------|--------|--------------------------|
| count | number | Number of facts to return |

## Example Response

```json
{
  "data": [
    "Mother cats teach their kittens to use the litter box.",
    "A cat can sprint at about thirty-one miles per hour.",
    "The worlds richest cat is worth $13 million."
  ]
}
```
