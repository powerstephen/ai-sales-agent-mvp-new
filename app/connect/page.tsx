"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { leads } from "@/lib/data";
import { googleSheetUrlToCsvUrl, normalizeImportedRows } from "@/lib/import";

export default function ConnectPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [error, setError] = useState("");

  const saveLeadsAndGo = (normalizedLeads: unknown) => {
    localStorage.setItem("uploadedLeads", JSON.stringify(normalizedLeads));
    localStorage.setItem("dataMode", "uploaded");
    router.push("/");
  };

  const handleUseSample = async () => {
    setError("");
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("uploadedLeads", JSON.stringify(leads));
      localStorage.setItem("dataMode", "sample");
      router.push("/");
    }, 1200);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError("");
      setLoading(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
        defval: "",
      });

      const normalized = normalizeImportedRows(rows);
      saveLeadsAndGo(normalized);
    } catch {
      setLoading(false);
      setError("Could not read that file. Please use CSV or Excel.");
    }
  };

  const handleGoogleSheetImport = async () => {
    try {
      setError("");
      setLoading(true);

      const csvUrl = googleSheetUrlToCsvUrl(sheetUrl);
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch sheet");
      }

      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: "string" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
        defval: "",
      });

      const normalized = normalizeImportedRows(rows);
      saveLeadsAndGo(normalized);
    } catch {
      setLoading(false);
      setError(
        "Could not import that Google Sheet. Make sure it is shared publicly or published, and try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Import your pipeline</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Use sample data, upload a spreadsheet, or import a public Google Sheet. This is designed for messy, real-world sales data, not just perfect CRM setups.
          </p>

          {!loading && (
            <>
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleUseSample}
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 text-left hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">Use sample dataset</div>
                  <div className="mt-1 text-sm text-gray-500">
                    Instant demo with preloaded lead and pipeline data
                  </div>
                </button>

                <label className="block w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-4 hover:bg-gray-50">
                  <div className="font-medium text-gray-900">Upload CSV or Excel</div>
                  <div className="mt-1 text-sm text-gray-500">
                    Import CRM exports, sales spreadsheets, or manual pipeline data
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </label>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="text-base font-semibold text-gray-900">Import Google Sheet</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Paste a public Google Sheets link. The app will try to convert it into a CSV import automatically.
                </p>

                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Paste Google Sheets URL"
                  className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-500"
                />

                <button
                  onClick={handleGoogleSheetImport}
                  disabled={!sheetUrl}
                  className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Import Google Sheet
                </button>
              </div>
            </>
          )}

          {loading && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">Analyzing your data</h2>
              <p className="mt-2 text-sm text-gray-600">
                Building ICP, scoring leads, and identifying missed pipeline...
              </p>

              <div className="mt-6 space-y-3">
                <div className="h-2 animate-pulse rounded bg-gray-200" />
                <div className="mx-auto h-2 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
