# BaFin MCP — Tool Reference

All tools use the `de_fin_` prefix. Every response includes a top-level `_meta` field with disclaimer, data age, copyright, and source URL. Error responses include `_error_type` and `_meta`.

---

## `de_fin_search_regulations`

Full-text search across BaFin Rundschreiben and Mindestanforderungen provisions.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | yes | Search term (e.g. `IT-Risikomanagement`, `Compliance-Funktion`) |
| `sourcebook` | `string` | no | Filter by circular ID: `MARISK`, `BAIT`, `VAIT`, `KAIT`, `MACOMP`, `MAGO`, `WPHG-RS` |
| `status` | `"in_force" \| "deleted" \| "not_yet_in_force"` | no | Filter by provision status |
| `limit` | `number` | no | Max results (default 20, max 100) |

**Returns**

```json
{
  "results": [
    {
      "id": 1,
      "sourcebook_id": "MARISK",
      "reference": "AT 7.2",
      "title": "IT-Risikomanagement",
      "text": "...",
      "type": "requirement",
      "status": "in_force",
      "effective_date": "2021-08-16",
      "chapter": "AT",
      "section": "7.2",
      "_citation": { "canonical_ref": "MARISK AT 7.2", "display_text": "...", "lookup": { "tool": "de_fin_get_regulation", "args": { "sourcebook": "MARISK", "reference": "AT 7.2" } } }
    }
  ],
  "count": 1,
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```

---

## `de_fin_get_regulation`

Fetch a specific BaFin provision by sourcebook and reference.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sourcebook` | `string` | yes | Circular identifier: `MARISK`, `BAIT`, `VAIT`, `KAIT`, `MACOMP`, `MAGO`, `WPHG-RS` |
| `reference` | `string` | yes | Full provision reference (e.g. `AT 7.2`, `BT 1.1`, `Abschnitt 5`) |

**Returns**

```json
{
  "id": 1,
  "sourcebook_id": "MARISK",
  "reference": "AT 7.2",
  "title": "IT-Risikomanagement",
  "text": "...",
  "type": "requirement",
  "status": "in_force",
  "effective_date": "2021-08-16",
  "_citation": { "canonical_ref": "MARISK AT 7.2", "display_text": "...", "lookup": { "tool": "de_fin_get_regulation", "args": { "sourcebook": "MARISK", "reference": "AT 7.2" } } },
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```

**Error** (`_error_type: "not_found"`) if no matching provision exists.

---

## `de_fin_list_sourcebooks`

List all available BaFin Rundschreiben and Mindestanforderungen.

**Parameters:** none

**Returns**

```json
{
  "sourcebooks": [
    { "id": "BAIT", "name": "Bankaufsichtliche Anforderungen an die IT", "description": "..." }
  ],
  "count": 7,
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```

---

## `de_fin_search_enforcement`

Search BaFin enforcement actions (fines, bans, restrictions, warnings).

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | yes | Search term (e.g. firm name, violation type, `Geldwaesche`) |
| `action_type` | `"fine" \| "ban" \| "restriction" \| "warning"` | no | Filter by action type |
| `limit` | `number` | no | Max results (default 20, max 100) |

**Returns**

```json
{
  "results": [
    {
      "id": 1,
      "firm_name": "Example GmbH",
      "reference_number": "BaFin-ID-12345",
      "action_type": "fine",
      "amount": 50000.0,
      "date": "2023-06-15",
      "summary": "...",
      "sourcebook_references": "MARISK AT 7.2",
      "_citation": { "canonical_ref": "BaFin-ID-12345", "display_text": "Example GmbH (BaFin-ID-12345)", "lookup": { "tool": "de_fin_search_enforcement", "args": { "query": "BaFin-ID-12345" } } }
    }
  ],
  "count": 1,
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```

---

## `de_fin_check_currency`

Check whether a specific BaFin provision is currently in force.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `reference` | `string` | yes | Full provision reference (e.g. `AT 7.2`, `BAIT Abschnitt 3`) |

**Returns**

```json
{
  "reference": "AT 7.2",
  "status": "in_force",
  "effective_date": "2021-08-16",
  "found": true,
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```

If not found, `found: false` and `status: "unknown"`.

---

## `de_fin_about`

Return server metadata: version, data source, and tool list.

**Parameters:** none

**Returns**

```json
{
  "name": "german-financial-regulation-mcp",
  "version": "0.1.0",
  "description": "...",
  "data_source": "BaFin (https://www.bafin.de/)",
  "tools": [ { "name": "de_fin_search_regulations", "description": "..." } ],
  "_meta": { "disclaimer": "...", "data_age": "...", "copyright": "...", "source_url": "..." }
}
```
