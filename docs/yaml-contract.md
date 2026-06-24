# YAML Contract — not-postman

This document defines the on-disk YAML format for all not-postman artifacts.

## Filesystem layout

```
workspace.yaml
collections/{collectionName}/
  collection.yaml
  {request-slug}.yaml
  {request-slug}.md              # optional co-located docs
  types/
    {ResponseName}.ts            # generated TypeScript interface
    {response-name}.json         # optional source JSON snapshot
environments/{envId}.yaml
```

One YAML file per API endpoint. Folder path serves as implicit category.

## Versioning

Every artifact file includes `version: 1` and a `kind` discriminator (`request`, `collection`, `environment`, or `workspace`). The v1 schema is additive-only: new optional fields may be added, but existing fields keep their meaning. Breaking changes require a new version number and manual file updates. There is no migration tooling — use git to review and revert changes in this local-first workspace.

---

## Shared primitives

### KeyValuePair

Used for headers, query params, path params, and environment variables.

```yaml
- key: string
  value: string          # supports {{envVar}} interpolation; empty when locked
  enabled: boolean
  description: string    # optional
  locked: boolean        # optional, default false — value lives in localStorage
```

When `locked: true`, the YAML records the key and flag but the actual value is stored in browser localStorage (never committed to disk).

---

## Request (`kind: request`)

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `version` | yes | `1` | Document format version |
| `kind` | yes | `"request"` | Discriminator |
| `id` | yes | string (UUID) | Immutable after creation |
| `name` | yes | string | Display name |
| `description` | no | string | Short summary |
| `method` | yes | enum | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS |
| `url` | yes | string | `{{baseUrlVar}}/path/:param` |
| `headers` | yes | KeyValuePair[] | Request headers |
| `query` | yes | KeyValuePair[] | Query parameters |
| `path` | yes | KeyValuePair[] | Path parameters (substitutes `:key`) |
| `body` | yes | object | `{ type, content? }` |
| `body.type` | yes | enum | none, json, text, xml, form-urlencoded, multipart |
| `body.content` | no | string | Body content when type != none |
| `docs` | no | string | Relative path to co-located `.md` file |
| `generated` | no | object | Type generation pointers |

### Generated types block

```yaml
generated:
  typescript: types/GetRandomFactResponse.ts   # relative to request file dir
  typeName: GetRandomFactResponse              # exported interface name
  sourceResponse: types/get-random-fact.json   # optional JSON snapshot
```

---

## Collection (`kind: collection`)

```yaml
version: 1
kind: collection
id: "<uuid>"
name: string
description: string  # optional
```

---

## Environment (`kind: environment`)

```yaml
version: 1
kind: environment
id: string
name: string
variables:
  - key: string
    value: string
    enabled: boolean
    description: string  # optional
```

---

## Workspace (`kind: workspace`)

```yaml
version: 1
kind: workspace
id: string
name: string
description: string    # optional
createdAt: ISO-8601    # optional
updatedAt: ISO-8601    # optional
```

---

## Full example

```yaml
version: 1
kind: request
id: "r0000000-0000-4000-8000-000000000001"
name: Random Fact
description: Get a single random cat fact
method: GET
url: "{{meowfactsBaseUrl}}/"
headers:
  - key: Accept
    value: application/json
    enabled: true
  - key: X-Api-Key
    value: ""
    enabled: true
    locked: true
query: []
path: []
body:
  type: none
docs: get-random-fact.md
generated:
  typescript: types/GetRandomFactResponse.ts
  typeName: GetRandomFactResponse
  sourceResponse: types/get-random-fact.json
```
