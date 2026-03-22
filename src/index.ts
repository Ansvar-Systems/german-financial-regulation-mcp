#!/usr/bin/env node

/**
 * German Financial Regulation MCP -- stdio entry point.
 *
 * Provides MCP tools for querying BaFin regulatory circulars (Rundschreiben):
 * MaRisk, BAIT, VAIT, KAIT, MaComp, MaGo, and WpHG-Rundschreiben.
 * Covers provisions, sourcebooks, enforcement actions, and currency checks.
 *
 * Tool prefix: de_fin_
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  listSourcebooks,
  searchProvisions,
  getProvision,
  searchEnforcement,
  checkProvisionCurrency,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pkgVersion = "0.1.0";
try {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "..", "package.json"), "utf8"),
  ) as { version: string };
  pkgVersion = pkg.version;
} catch {
  // fallback to default
}

const SERVER_NAME = "german-financial-regulation-mcp";

// --- Tool definitions ---

const TOOLS = [
  {
    name: "de_fin_search_regulations",
    description:
      "Volltextsuche in BaFin-Rundschreiben und Mindestanforderungen. Gibt passende Anforderungen, Hinweise und Erlauterungen aus MaRisk, BAIT, VAIT, KAIT, MaComp und MaGo zuruck.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Suchbegriff (z.B. 'IT-Risikomanagement', 'Informationssicherheit', 'Compliance-Funktion')",
        },
        sourcebook: {
          type: "string",
          description: "Filter nach Rundschreiben-ID (z.B. MARISK, BAIT, VAIT, KAIT, MACOMP). Optional.",
        },
        status: {
          type: "string",
          enum: ["in_force", "deleted", "not_yet_in_force"],
          description: "Filter nach Status der Vorschrift. Standard: alle Statuswerte.",
        },
        limit: {
          type: "number",
          description: "Maximale Anzahl der Ergebnisse. Standard: 20.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "de_fin_get_regulation",
    description:
      "Ruft eine bestimmte BaFin-Vorschrift anhand von Rundschreiben und Referenz ab. Akzeptiert Referenzen wie 'AT 7.2' (MaRisk) oder 'Abschnitt 3.1' (BAIT).",
    inputSchema: {
      type: "object" as const,
      properties: {
        sourcebook: {
          type: "string",
          description: "Rundschreiben-Kennung (z.B. MARISK, BAIT, VAIT, KAIT, MACOMP)",
        },
        reference: {
          type: "string",
          description: "Vollstaendige Vorschriftreferenz (z.B. 'AT 7.2', 'BT 1.1', 'Abschnitt 5')",
        },
      },
      required: ["sourcebook", "reference"],
    },
  },
  {
    name: "de_fin_list_sourcebooks",
    description:
      "Listet alle verfugbaren BaFin-Rundschreiben und Mindestanforderungen mit Namen und Beschreibungen auf.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "de_fin_search_enforcement",
    description:
      "Suche in BaFin-Massnahmen -- Bussgeldentscheidungen, Untersagungen, Anordnungen und Verwarnungen. Gibt passende Aufsichtsmassnahmen zuruck.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Suchbegriff (z.B. Firmenname, Verstossart, 'Geldwaesche')",
        },
        action_type: {
          type: "string",
          enum: ["fine", "ban", "restriction", "warning"],
          description: "Filter nach Massnahmenart. Optional.",
        },
        limit: {
          type: "number",
          description: "Maximale Anzahl der Ergebnisse. Standard: 20.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "de_fin_check_currency",
    description:
      "Pruft ob eine bestimmte BaFin-Vorschrift aktuell in Kraft ist. Gibt Status und Datum des Inkrafttretens zuruck.",
    inputSchema: {
      type: "object" as const,
      properties: {
        reference: {
          type: "string",
          description: "Vollstaendige Vorschriftreferenz (z.B. 'AT 7.2', 'BAIT Abschnitt 3')",
        },
      },
      required: ["reference"],
    },
  },
  {
    name: "de_fin_about",
    description: "Gibt Metadaten uber diesen MCP-Server zuruck: Version, Datenquelle, Werkzeugliste.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// --- Zod schemas for argument validation ---

const SearchRegulationsArgs = z.object({
  query: z.string().min(1),
  sourcebook: z.string().optional(),
  status: z.enum(["in_force", "deleted", "not_yet_in_force"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const GetRegulationArgs = z.object({
  sourcebook: z.string().min(1),
  reference: z.string().min(1),
});

const SearchEnforcementArgs = z.object({
  query: z.string().min(1),
  action_type: z.enum(["fine", "ban", "restriction", "warning"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const CheckCurrencyArgs = z.object({
  reference: z.string().min(1),
});

// --- Helper ---

function textContent(data: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(data, null, 2) },
    ],
  };
}

function errorContent(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

// --- Server setup ---

const server = new Server(
  { name: SERVER_NAME, version: pkgVersion },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "de_fin_search_regulations": {
        const parsed = SearchRegulationsArgs.parse(args);
        const results = searchProvisions({
          query: parsed.query,
          sourcebook: parsed.sourcebook,
          status: parsed.status,
          limit: parsed.limit,
        });
        return textContent({ results, count: results.length });
      }

      case "de_fin_get_regulation": {
        const parsed = GetRegulationArgs.parse(args);
        const provision = getProvision(parsed.sourcebook, parsed.reference);
        if (!provision) {
          return errorContent(
            `Vorschrift nicht gefunden: ${parsed.sourcebook} ${parsed.reference}`,
          );
        }
        return textContent(provision);
      }

      case "de_fin_list_sourcebooks": {
        const sourcebooks = listSourcebooks();
        return textContent({ sourcebooks, count: sourcebooks.length });
      }

      case "de_fin_search_enforcement": {
        const parsed = SearchEnforcementArgs.parse(args);
        const results = searchEnforcement({
          query: parsed.query,
          action_type: parsed.action_type,
          limit: parsed.limit,
        });
        return textContent({ results, count: results.length });
      }

      case "de_fin_check_currency": {
        const parsed = CheckCurrencyArgs.parse(args);
        const currency = checkProvisionCurrency(parsed.reference);
        return textContent(currency);
      }

      case "de_fin_about": {
        return textContent({
          name: SERVER_NAME,
          version: pkgVersion,
          description:
            "BaFin (Bundesanstalt fuer Finanzdienstleistungsaufsicht) MCP-Server. Bietet Zugang zu BaFin-Rundschreiben und Mindestanforderungen: MaRisk, BAIT, VAIT, KAIT, MaComp, MaGo und WpHG-Rundschreiben sowie Aufsichtsmassnahmen.",
          data_source: "BaFin (https://www.bafin.de/)",
          tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        });
      }

      default:
        return errorContent(`Unbekanntes Werkzeug: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorContent(`Fehler beim Ausfuhren von ${name}: ${message}`);
  }
});

// --- Main ---

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`${SERVER_NAME} v${pkgVersion} running on stdio\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
