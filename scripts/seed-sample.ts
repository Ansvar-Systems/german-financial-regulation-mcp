/**
 * Seed the BaFin database with sample provisions for testing.
 *
 * Inserts representative provisions from MaRisk, BAIT, VAIT, KAIT, MaComp,
 * MaGo, and WpHG-Rundschreiben so MCP tools can be tested without running a
 * full BaFin data ingestion pipeline.
 *
 * Usage:
 *   npx tsx scripts/seed-sample.ts
 *   npx tsx scripts/seed-sample.ts --force   # drop and recreate
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_SQL } from "../src/db.js";

const DB_PATH = process.env["BAFIN_DB_PATH"] ?? "data/bafin.db";
const force = process.argv.includes("--force");

// Bootstrap database

const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

if (force && existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log(`Datenbank geloescht: ${DB_PATH}`);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA_SQL);

console.log(`Datenbank initialisiert: ${DB_PATH}`);

// Sourcebooks

interface SourcebookRow {
  id: string;
  name: string;
  description: string;
}

const sourcebooks: SourcebookRow[] = [
  {
    id: "MARISK",
    name: "MaRisk (Mindestanforderungen an das Risikomanagement)",
    description:
      "BaFin-Rundschreiben 10/2021 (BA): Mindestanforderungen an das Risikomanagement der Kreditinstitute. Legt organisatorische und prozessuale Anforderungen fuer ein angemessenes Risikomanagement fest.",
  },
  {
    id: "BAIT",
    name: "BAIT (Bankaufsichtliche Anforderungen an die IT)",
    description:
      "BaFin-Rundschreiben 10/2017 (BA) i.d.F. 2021: Mindestanforderungen fuer IT-Systeme, IT-Sicherheit, IT-Auslagerung und IT-Notfallmanagement bei Kreditinstituten.",
  },
  {
    id: "VAIT",
    name: "VAIT (Versicherungsaufsichtliche Anforderungen an die IT)",
    description:
      "BaFin-Rundschreiben 10/2018 (VA) i.d.F. 2022: IT-Anforderungen fuer Versicherungsunternehmen. Entspricht inhaltlich der BAIT, angepasst an den Versicherungsbereich.",
  },
  {
    id: "KAIT",
    name: "KAIT (Kapitalverwaltungsaufsichtliche Anforderungen an die IT)",
    description:
      "BaFin-Rundschreiben 08/2021 (WA): IT-Anforderungen fuer Kapitalverwaltungsgesellschaften (KVGen). Deckt IT-Governance, Informationssicherheit und Auslagerung ab.",
  },
  {
    id: "MACOMP",
    name: "MaComp (Mindestanforderungen an die Compliance-Funktion)",
    description:
      "BaFin-Rundschreiben 05/2010 (WA) i.d.F. 2023: Mindestanforderungen an Compliance-Funktion und weitere Verhaltens-, Organisations- und Transparenzpflichten nach WpHG.",
  },
  {
    id: "MAGO",
    name: "MaGo (Mindestanforderungen an die Geschaeftsorganisation)",
    description:
      "BaFin-Rundschreiben 02/2017 (VA): Mindestanforderungen an die Geschaeftsorganisation von Versicherungsunternehmen. Umfasst Governance, Risikomanagement und interne Kontrollen.",
  },
  {
    id: "WPHG-RS",
    name: "WpHG-Rundschreiben",
    description:
      "BaFin-Rundschreiben zu Wohlverhaltens- und Organisationspflichten nach dem Wertpapierhandelsgesetz (WpHG). Enthalt Konkretisierungen zu MiFID II-Anforderungen.",
  },
];

const insertSourcebook = db.prepare(
  "INSERT OR IGNORE INTO sourcebooks (id, name, description) VALUES (?, ?, ?)",
);

for (const sb of sourcebooks) {
  insertSourcebook.run(sb.id, sb.name, sb.description);
}

console.log(`${sourcebooks.length} Rundschreiben eingefuegt`);

// Sample provisions

interface ProvisionRow {
  sourcebook_id: string;
  reference: string;
  title: string;
  text: string;
  type: string;
  status: string;
  effective_date: string;
  chapter: string;
  section: string;
}

const provisions: ProvisionRow[] = [
  // MaRisk AT (Allgemeiner Teil)
  {
    sourcebook_id: "MARISK",
    reference: "AT 1",
    title: "Vorbemerkung",
    text: "Die MaRisk konkretisieren die Anforderungen des § 25a KWG an ein angemessenes Risikomanagement. Sie legen fest, welche organisatorischen und prozessualen Mindestanforderungen Kreditinstitute und Finanzdienstleistungsinstitute bei der Ausgestaltung ihres Risikomanagements erfullen muessen. Die Rundschreibenregelungen sind grundsatzlich auf alle Institute anzuwenden.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-08-16",
    chapter: "AT",
    section: "AT 1",
  },
  {
    sourcebook_id: "MARISK",
    reference: "AT 4.3.2",
    title: "Risikosteuerungs- und -controllingprozesse",
    text: "Die Risikosteuerungs- und -controllingprozesse muessen gewaehrleisten, dass wesentliche Risiken fruehzeitig erkannt, vollstaendig erfasst und in angemessener Weise dargestellt werden. Fuer die einzelnen Risikoarten sind geeignete Risikomessverfahren einzusetzen, die die wesentlichen Risiken des Instituts erfassen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-08-16",
    chapter: "AT",
    section: "AT 4.3",
  },
  {
    sourcebook_id: "MARISK",
    reference: "AT 7.2",
    title: "Technisch-organisatorische Ausstattung",
    text: "Die technisch-organisatorische Ausstattung des Instituts muss insbesondere im Hinblick auf die IT-Systeme (Hardware- und Software-Komponenten) und die dazugehorigen IT-Prozesse den internen Anforderungen des Instituts entsprechen. Die IT-Systeme muessen die Integritat, die Verfugbarkeit, die Authentizitaet sowie die Vertraulichkeit der Daten sicherstellen. Fur die sonstige technisch-organisatorische Ausstattung gilt dies in analoger Weise. Die genannten Anforderungen werden durch die BAIT konkretisiert.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-08-16",
    chapter: "AT",
    section: "AT 7",
  },
  {
    sourcebook_id: "MARISK",
    reference: "AT 9",
    title: "Auslagerungen",
    text: "Lagert ein Institut wesentliche Aktivitaeten und Prozesse auf ein anderes Unternehmen aus, so muss es sicherstellen, dass die gesetzlichen und aufsichtlichen Anforderungen eingehalten werden. Das Institut bleibt fuer die ausgelagerten Aktivitaeten und Prozesse gegenueber der Aufsicht verantwortlich. Vor der Auslagerung ist eine angemessene Risikoanalyse durchzufuhren.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-08-16",
    chapter: "AT",
    section: "AT 9",
  },
  {
    sourcebook_id: "MARISK",
    reference: "BT 1.1",
    title: "Adressenausfallrisiken — Kreditgewaehrung",
    text: "Kreditgewaehrungen muessen auf der Grundlage angemessener Informationen uber den Kreditnehmer erfolgen. Es sind Kriterien festzulegen, nach denen eine Kreditgewaehrung zu beurteilen ist. Die Beurteilung hat regelmaessig in einem Kreditbeschluss zu munden.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-08-16",
    chapter: "BT",
    section: "BT 1",
  },

  // BAIT
  {
    sourcebook_id: "BAIT",
    reference: "BAIT 1",
    title: "IT-Strategie",
    text: "Das Institut hat eine IT-Strategie zu entwickeln, die mit der Geschaftsstrategie konsistent ist. Die IT-Strategie beschreibt die wesentlichen Aspekte der IT-Architektur, die IT-Sicherheitsstrategie, den Umgang mit IT-Risiken sowie die Anforderungen an die IT-Auslagerungen. Sie ist regelmaessig auf Aktualitaet und Umsetzung zu uberprufen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-11-01",
    chapter: "1",
    section: "1",
  },
  {
    sourcebook_id: "BAIT",
    reference: "BAIT 3",
    title: "Informationsrisikomanagement",
    text: "Das Institut hat ein umfassendes Informationsrisikomanagement zu implementieren. Dies umfasst die Identifikation, Bewertung, Steuerung und Uberwachung von Informationsrisiken. Es ist ein Schutzbedarfsfeststellungsverfahren einzufuhren, das die Schutzbedarfe aller Informationen und IT-Systeme in Bezug auf Vertraulichkeit, Integritat und Verfugbarkeit bestimmt.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-11-01",
    chapter: "3",
    section: "3",
  },
  {
    sourcebook_id: "BAIT",
    reference: "BAIT 4",
    title: "Informationssicherheitsmanagement",
    text: "Das Institut hat ein Informationssicherheitsmanagementsystem (ISMS) einzurichten und aufrechtzuerhalten. Dieses umfasst Informationssicherheitsleitlinie, Informationssicherheitsrichtlinien, einen Informationssicherheitsbeauftragten sowie Prozesse zur Identifikation, Bewertung und Behandlung von Informationssicherheitsrisiken. Das ISMS ist regelmaessig zu uberprufen und weiterzuentwickeln.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-11-01",
    chapter: "4",
    section: "4",
  },
  {
    sourcebook_id: "BAIT",
    reference: "BAIT 5",
    title: "Operatives IT-Sicherheitsmanagement",
    text: "Das Institut hat ein operatives IT-Sicherheitsmanagement zu betreiben, das den Schutz der IT-Systeme sicherstellt. Dazu gehoeren Massnahmen zum Schutz vor Bedrohungen aus dem Internet, die Verwaltung von Berechtigungen, das Patch-Management, die Netzwerksicherheit sowie die Ueberwachung der IT-Systeme (Security Monitoring). Sicherheitsvorfaelle sind zu erkennen, zu melden und zu beheben.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-11-01",
    chapter: "5",
    section: "5",
  },
  {
    sourcebook_id: "BAIT",
    reference: "BAIT 9",
    title: "IT-Notfallmanagement",
    text: "Das Institut hat ein IT-Notfallmanagement zu betreiben, das die Wiederherstellung des IT-Betriebs nach schwerwiegenden Storfallen sicherstellt. Notfallplane sind zu erstellen, zu dokumentieren und regelmaessig zu testen. Die Wiederanlaufzeiten (RTO) und Wiederherstellungspunkte (RPO) sind fuer kritische IT-Systeme festzulegen und einzuhalten.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-11-01",
    chapter: "9",
    section: "9",
  },

  // VAIT
  {
    sourcebook_id: "VAIT",
    reference: "VAIT 1",
    title: "IT-Strategie (Versicherungen)",
    text: "Das Versicherungsunternehmen hat eine IT-Strategie zu entwickeln, die mit der Geschaftsstrategie und der Risikostrategie konsistent ist. Die IT-Strategie beschreibt die wesentlichen Aspekte der IT-Architektur, der IT-Sicherheit und des Umgangs mit IT-Risiken. Sie ist regelmaessig auf Aktualitaet und Umsetzung zu uberprufen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2022-03-07",
    chapter: "1",
    section: "1",
  },
  {
    sourcebook_id: "VAIT",
    reference: "VAIT 4",
    title: "Informationssicherheitsmanagement (Versicherungen)",
    text: "Das Versicherungsunternehmen hat ein Informationssicherheitsmanagementsystem einzurichten. Dieses umfasst eine Informationssicherheitsleitlinie, geeignete Richtlinien, einen Informationssicherheitsbeauftragten sowie Prozesse zur Risikobehandlung. Sicherheitsvorfaelle sind zu dokumentieren und an die BaFin zu melden, soweit sie wesentlich sind.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2022-03-07",
    chapter: "4",
    section: "4",
  },

  // KAIT
  {
    sourcebook_id: "KAIT",
    reference: "KAIT 1",
    title: "IT-Strategie (Kapitalverwaltung)",
    text: "Die Kapitalverwaltungsgesellschaft hat eine IT-Strategie zu entwickeln und umzusetzen. Diese muss mit der Geschaftsstrategie konsistent sein und die wesentlichen Aspekte des IT-Einsatzes, der IT-Sicherheit sowie der IT-Auslagerungen abdecken. Die IT-Strategie ist mindestens jaehrlich auf Aktualitaet zu uberprufen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-12-16",
    chapter: "1",
    section: "1",
  },
  {
    sourcebook_id: "KAIT",
    reference: "KAIT 5",
    title: "IT-Auslagerungen (Kapitalverwaltung)",
    text: "Bei der Auslagerung von IT-Systemen und IT-Dienstleistungen sind die Anforderungen des KAGB und der AIFM-Richtlinie zu beachten. Die KVG bleibt fur ausgelagerte IT-Dienstleistungen verantwortlich und hat geeignete Uberwachungsmassnahmen zu implementieren. IT-Auslagerungen an Cloud-Anbieter unterliegen besonderen Anforderungen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2021-12-16",
    chapter: "5",
    section: "5",
  },

  // MaComp
  {
    sourcebook_id: "MACOMP",
    reference: "AT 1",
    title: "Gegenstand und Zweck",
    text: "Dieses Rundschreiben konkretisiert die Anforderungen an die Compliance-Funktion und weitere Verhaltens-, Organisations- und Transparenzpflichten nach dem Wertpapierhandelsgesetz (WpHG). Es gilt fuer Wertpapierdienstleistungsunternehmen und legt Mindeststandards fuer eine ordnungsgemaesse Compliance-Organisation fest.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2023-01-01",
    chapter: "AT",
    section: "AT 1",
  },
  {
    sourcebook_id: "MACOMP",
    reference: "BT 1",
    title: "Compliance-Funktion",
    text: "Das Wertpapierdienstleistungsunternehmen muss eine wirksame und dauerhafte Compliance-Funktion einrichten, die eigenverantwortlich taetig ist und folgende Aufgaben hat: Uberwachung der Einhaltung der gesetzlichen und internen Regelungen, Beratung der Geschaftsleitung und Mitarbeiter, Risikobeurteilung und Berichterstattung. Der Compliance-Beauftragte muss uber ausreichende Ressourcen und Befugnisse verfugen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2023-01-01",
    chapter: "BT",
    section: "BT 1",
  },
  {
    sourcebook_id: "MACOMP",
    reference: "BT 2",
    title: "Interessenkonflikte",
    text: "Das Unternehmen hat wirksame Massnahmen zu treffen, um Interessenkonflikte zwischen dem Unternehmen oder seinen Mitarbeitern einerseits und seinen Kunden andererseits zu erkennen. Es sind angemessene organisatorische und administrative Vorkehrungen zu treffen, um Interessenkonflikte, die den Interessen der Kunden schaden koennten, zu verhindern.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2023-01-01",
    chapter: "BT",
    section: "BT 2",
  },

  // MaGo
  {
    sourcebook_id: "MAGO",
    reference: "MaGo 1",
    title: "Governance-System (Solvency II)",
    text: "Das Versicherungsunternehmen muss ein wirksames Governance-System vorhalten, das eine solide und umsichtige Leitung des Unternehmens gewaehrleistet. Das Governance-System umfasst mindestens eine angemessene, transparente Organisationsstruktur mit klarer Zuweisung und angemessener Trennung der Verantwortlichkeiten sowie ein wirksames System zur Gewaehrleistung der Uebermittlung von Informationen.",
    type: "Anforderung",
    status: "in_force",
    effective_date: "2017-02-24",
    chapter: "1",
    section: "1",
  },

  // WpHG-Rundschreiben
  {
    sourcebook_id: "WPHG-RS",
    reference: "WpHG-RS 4/2010",
    title: "Anforderungen an Compliance-Funktion nach WpHG",
    text: "Das Rundschreiben konkretisiert die Anforderungen an die Compliance-Funktion nach §§ 80, 81 WpHG. Es legt fest, dass Wertpapierdienstleistungsunternehmen eine permanente Compliance-Funktion einzurichten haben, die eigenverantwortlich taetig ist. Die Compliance-Funktion muss uber ausreichende Befugnisse, Mittel und fachkundiges Personal verfuegen.",
    type: "Rundschreiben",
    status: "in_force",
    effective_date: "2010-10-07",
    chapter: "1",
    section: "1",
  },
];

const insertProvision = db.prepare(`
  INSERT INTO provisions (sourcebook_id, reference, title, text, type, status, effective_date, chapter, section)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAll = db.transaction(() => {
  for (const p of provisions) {
    insertProvision.run(
      p.sourcebook_id,
      p.reference,
      p.title,
      p.text,
      p.type,
      p.status,
      p.effective_date,
      p.chapter,
      p.section,
    );
  }
});

insertAll();

console.log(`${provisions.length} Vorschriften eingefuegt`);

// Sample enforcement actions

interface EnforcementRow {
  firm_name: string;
  reference_number: string;
  action_type: string;
  amount: number;
  date: string;
  summary: string;
  sourcebook_references: string;
}

const enforcements: EnforcementRow[] = [
  {
    firm_name: "Deutsche Bank AG",
    reference_number: "BaFin-2019-DE",
    action_type: "fine",
    amount: 9_000_000,
    date: "2019-07-25",
    summary:
      "BaFin verhaegte ein Bussgeld gegen die Deutsche Bank AG wegen Verstaessen gegen Geldwaeschevorschriften. Das Institut hatte keine angemessenen Sorgfaltspflichten gegenueber Geschaftspartnern und Kunden aus dem Hochrisikobereich angewendet. Betroffen waren Transaktionen aus einem Zeitraum von mehreren Jahren. Das Bussgeld basierte auf Verstaessen gegen § 25h KWG.",
    sourcebook_references: "MARISK AT 4.3.2, MARISK BT 1.1",
  },
  {
    firm_name: "Wirecard Bank AG",
    reference_number: "BaFin-2020-WC",
    action_type: "ban",
    amount: 0,
    date: "2020-06-25",
    summary:
      "BaFin untersagte der Wirecard Bank AG den Geschaeftsbetrieb nach Aufdeckung des Bilanzskandals bei der Wirecard AG. Es stellte sich heraus, dass Treuhandkonten mit einem Volumen von 1,9 Milliarden Euro nicht existierten. BaFin leitete umfangreiche Aufsichtsmassnahmen ein und ordnete die Abwicklung der Bank an. Der Fall fuhrte zur grundlegenden Reform der deutschen Bilanzkontrolle.",
    sourcebook_references: "MARISK AT 4.3.2, MARISK AT 9",
  },
  {
    firm_name: "N26 Bank GmbH",
    reference_number: "BaFin-2021-N26",
    action_type: "restriction",
    amount: 4_250_000,
    date: "2021-11-15",
    summary:
      "BaFin verhaegte ein Bussgeld und erliess Sonderbeauftragte-Anordnung gegen N26 wegen erheblicher Maengel bei der Geldwaeschepravention. Das Institut hatte kein angemessenes Risikomanagement fuer Geldwaesche eingerichtet und die Zahl der Neukundenregistrierungen wurde durch BaFin auf 50.000 pro Monat begrenzt, um die Behebung der Defizite zu ermoeglichen. Die Massnahmen wurden erst nach Nachweis der Behebung aller Maengel aufgehoben.",
    sourcebook_references: "MARISK AT 4.3.2, MACOMP BT 1",
  },
];

const insertEnforcement = db.prepare(`
  INSERT INTO enforcement_actions (firm_name, reference_number, action_type, amount, date, summary, sourcebook_references)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertEnforcementsAll = db.transaction(() => {
  for (const e of enforcements) {
    insertEnforcement.run(
      e.firm_name,
      e.reference_number,
      e.action_type,
      e.amount,
      e.date,
      e.summary,
      e.sourcebook_references,
    );
  }
});

insertEnforcementsAll();

console.log(`${enforcements.length} Aufsichtsmassnahmen eingefuegt`);

// Summary

const provisionCount = (
  db.prepare("SELECT count(*) as cnt FROM provisions").get() as {
    cnt: number;
  }
).cnt;
const sourcebookCount = (
  db.prepare("SELECT count(*) as cnt FROM sourcebooks").get() as {
    cnt: number;
  }
).cnt;
const enforcementCount = (
  db.prepare("SELECT count(*) as cnt FROM enforcement_actions").get() as {
    cnt: number;
  }
).cnt;
const ftsCount = (
  db.prepare("SELECT count(*) as cnt FROM provisions_fts").get() as {
    cnt: number;
  }
).cnt;

console.log(`\nDatenbankuebersicht:`);
console.log(`  Rundschreiben:        ${sourcebookCount}`);
console.log(`  Vorschriften:         ${provisionCount}`);
console.log(`  Aufsichtsmassnahmen:  ${enforcementCount}`);
console.log(`  FTS-Eintraege:        ${ftsCount}`);
console.log(`\nFertig. Datenbank bereit: ${DB_PATH}`);

db.close();
