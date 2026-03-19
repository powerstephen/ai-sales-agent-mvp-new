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

  const saveLeads = (data: unknown) => {
    localStorage.setItem("uploadedLeads", JSON.stringify(data));
    localStorage.setItem("dataMode", "uploaded");
  };

  const saveDeals = (data: unknown) => {
    localStorage.setItem("uploadedDeals", JSON.stringify(data));
  };

  const handleUseSample = () => {
    setError("");
    setLoading(true);

    setTimeout(() => {
      saveLeads(leads);
      router.push("/");
    }, 1200);
  };

  const handleLeadsUpload = async (file: File) => {
    try {
      setError("");
      setLoading(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const normalized = normalizeImportedRows(rows);
      saveLeads(normalized);
      router.push("/");
    } catch {
      setLoading(false);
      setError("Could not import leads file. Please use CSV or Excel.");
    }
  };

  const handleDealsUpload = async (file: File) => {
    try {
      setError("");
      setLoading(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      saveDeals(rows);
      setLoading(false);
      alert("Deals uploaded successfully");
    } catch {
      setLoading(false);
      setError("Could not import deals file. Please use CSV or Excel.");
    }
  };

  const handleGoogleSheet = async () => {
    try {
      setError("");
      setLoading(true);

      const csvUrl = googleSheetUrlToCsvUrl(sheetUrl);
      const res = await fetch(csvUrl);

      if (!res.ok) {
        throw new Error("Failed to fetch Google Sheet");
      }

      const text = await res.text();
      const workbook = XLSX.read(text, { type: "string" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const normalized = normalizeImportedRows(rows);
      saveLeads(normalized);
      router.push("/");
    } catch {
      setLoading(false);
      setError(
        "Could not import that Google Sheet. Make sure it is public or published, then try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Import your pipeline</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Use sample data, upload leads, upload deals, or import a public Google Sheet.
        </p>

        {!loading && (
          <div className="mt-8 space-y-4">
            <button
              onClick={handleUseSample}
              className="w-full rounded-xl border border-gray-300 p-4 text-left hover:bg-gray-50"
            >
              <div className="font-medium text-gray-900">Use sample data</div>
              <div className="mt-1 text-sm text-gray-500">
                Load a demo dataset instantly
              </div>
            </button>

            <label className="block cursor-pointer rounded-xl border border-gray-300 p-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Upload Leads CSV / Excel</div>
              <div className="mt-1 text-sm text-gray-500">
                Import lead, contact, or pipeline data
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLeadsUpload(file);
                }}
              />
            </label>

            <label className="block cursor-pointer rounded-xl border border-gray-300 p-4 hover:bg-gray-50">
              <div className="font-medium text-gray-900">Upload Deals CSV / Excel</div>
              <div className="mt-1 text-sm text-gray-500">
                Import won/lost deals and revenue history
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDealsUpload(file);
                }}
              />
            </label>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-base font-semibold text-gray-900">Import Google Sheet</h2>
              <p className="mt-2 text-sm text-gray-600">
                Paste a public Google Sheets link. The app will convert it to CSV and import it as leads.
              </p>

              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Paste Google Sheet URL"
                className="mt-4 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-gray-500"
              />

              <button
                onClick={handleGoogleSheet}
                disabled={!sheetUrl}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Import Google Sheet
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900">Analyzing data</h2>
            <p className="mt-2 text-sm text-gray-600">
              Building ICP, scoring leads, and identifying opportunities...
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
    </main>
  );
}
