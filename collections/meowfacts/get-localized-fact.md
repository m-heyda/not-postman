# Localized Fact

Returns a cat fact in a specified language.

## Endpoint

```
GET {{meowfactsBaseUrl}}/?lang=ukr
```

## Parameters

| Param | Type   | Description                |
|-------|--------|----------------------------|
| lang  | string | Language code (see below)  |

## Supported Languages

| Code      | Language    | Country |
|-----------|-------------|---------|
| eng-us    | English     | USA     |
| ger-de    | German      | DE      |
| esp-mx    | Spanish     | MX      |
| rus-ru    | Russian     | RUS     |
| por-br    | Portuguese  | BR      |
| ukr-ua    | Ukrainian   | UA      |
| ita-it    | Italian     | IT      |
| kor-ko    | Korean      | KO      |
| zho-tw    | Chinese     | TW      |

Short codes also work: `eng`, `ger`, `esp`, `ukr`, etc.
