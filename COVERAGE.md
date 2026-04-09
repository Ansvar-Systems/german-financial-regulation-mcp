# BaFin MCP — Data Coverage

This document describes what regulatory sourcebooks are included in the German Financial Regulation MCP and what is not yet covered.

## Sourcebooks

| ID | Name | Version | Status |
|----|------|---------|--------|
| `MARISK` | Mindestanforderungen an das Risikomanagement | 2021-08-16 | Sample |
| `BAIT` | Bankaufsichtliche Anforderungen an die IT | 2021-11-01 | Sample |
| `VAIT` | Versicherungsaufsichtliche Anforderungen an die IT | 2022-03-07 | Sample |
| `KAIT` | Kapitalverwaltungsaufsichtliche Anforderungen an die IT | 2021-12-16 | Sample |
| `MACOMP` | Mindestanforderungen an die Compliance-Funktion | 2023-01-01 | Sample |
| `MAGO` | Mindestanforderungen an die Geschaeftsorganisation | 2017-02-24 | Sample |
| `WPHG-RS` | WpHG-Rundschreiben | 2010-10-07 | Sample |

**Status legend:** *Sample* = a small set of representative provisions is included for development and testing. Production ingestion of the full text is not yet complete.

## Coverage Details

Each sourcebook currently contains a small number of sample provisions seeded via `scripts/seed-sample.ts`. The sample data is sufficient to exercise all MCP tools but does not represent full regulatory coverage.

### What is covered (sample)
- Key section headers and requirement text from each circular
- Representative provisions from MaRisk AT/BT chapters
- BAIT and VAIT section structures
- Sample BaFin enforcement actions (Bussgeld, Untersagungen, Verwarnungen)

### What is NOT covered
- Full text of all provisions across all circulars
- Historical versions of circulars (pre-2017)
- BaFin guidance letters (Auslegungsentscheidungen)
- BaFin Q&A documents
- Supervisory notices (Aufsichtsmitteilungen)
- Enforcement actions beyond the seeded sample

## Roadmap

Full ingestion pipeline is tracked in `.github/workflows/ingest.yml`. Run the `Trigger ingest` workflow dispatch to re-seed from the latest BaFin publications.

## Data Sources

All data is sourced from publicly available BaFin publications at [https://www.bafin.de/](https://www.bafin.de/).

> **Disclaimer:** Diese Informationen dienen ausschliesslich Informationszwecken und stellen keine Rechts- oder Regulierungsberatung dar. BaFin-Anforderungen koennen sich aendern. Konsultieren Sie stets qualifizierte Fachleute.
