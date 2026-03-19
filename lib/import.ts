import { Lead } from "@/lib/types";

type GenericRow = Record<string, unknown>;

function getString(row: GenericRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return fallback;
}

function getNumber(row: GenericRow, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return fallback;
}

function normalizeLifecycleStage(value: string): Lead["lifecycleStage"] {
  const lower = value.toLowerCase();
  if (lower.includes("opportunity")) return "opportunity";
  if (lower.includes("customer")) return "customer";
  if (lower.includes("stalled")) return "stalled";
  return "lead";
}

function buildSignalFromRow(row: GenericRow): string {
  const explicit = getString(row, ["signal", "company_signal", "growth_signal"]);
  if (explicit) return explicit;

  const notes = getString(row, ["notes", "note", "activity_note"]);
  if (notes) return notes;

  return "No external signal provided";
}

function buildActivities(row: GenericRow) {
  const activities = [];

  const note1 = getString(row, ["activity_1", "activity", "note", "notes"]);
  const note2 = getString(row, ["activity_2"]);
  const note3 = getString(row, ["activity_3"]);

  if (note1) {
    activities.push({
      type: "note" as const,
      note: note1,
      daysAgo: getNumber(row, ["activity_1_days_ago", "days_ago"], 14),
    });
  }

  if (note2) {
    activities.push({
      type: "note" as const,
      note: note2,
      daysAgo: getNumber(row, ["activity_2_days_ago"], 30),
    });
  }

  if (note3) {
    activities.push({
      type: "note" as const,
      note: note3,
      daysAgo: getNumber(row, ["activity_3_days_ago"], 45),
    });
  }

  if (activities.length === 0) {
    activities.push({
      type: "note" as const,
      note: "Imported from spreadsheet",
      daysAgo: getNumber(row, ["last_contacted_days", "days_since_contact"], 30),
    });
  }

  return activities;
}

export function normalizeImportedRows(rows: GenericRow[]): Lead[] {
  return rows
    .filter((row) => {
      const company = getString(row, ["company", "account", "company_name"]);
      const name = getString(row, ["name", "contact", "contact_name"]);
      return company || name;
    })
    .map((row, index) => {
      const company = getString(row, ["company", "account", "company_name"], `Imported Company ${index + 1}`);
      const name = getString(row, ["name", "contact", "contact_name"], `Imported Contact ${index + 1}`);
      const title = getString(row, ["title", "job_title", "role"], "Unknown Title");
      const email = getString(row, ["email", "work_email"], `contact${index + 1}@example.com`);
      const industry = getString(row, ["industry"], "B2B SaaS");
      const employees = getNumber(row, ["employees", "employee_count", "company_size"], 100);
      const location = getString(row, ["location", "country", "region"], "Unknown");
      const signal = buildSignalFromRow(row);
      const lifecycleStage = normalizeLifecycleStage(
        getString(row, ["lifecycle_stage", "stage"], "lead")
      );
      const lastContactedDays = getNumber(
        row,
        ["last_contacted_days", "days_since_contact", "days_open"],
        45
      );

      return {
        id: `uploaded_${index + 1}`,
        name,
        email,
        title,
        company,
        lifecycleStage,
        lastContactedDays,
        companyData: {
          industry,
          employees,
          location,
          signal,
          domain: getString(row, ["domain", "website"], company.toLowerCase().replace(/\s+/g, "") + ".com"),
        },
        activities: buildActivities(row),
      } satisfies Lead;
    });
}

export function googleSheetUrlToCsvUrl(url: string): string {
  if (url.includes("/export?format=csv")) return url;

  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return url;

  const docId = match[1];
  const gidMatch = url.match(/[?&]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : "0";

  return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
}
