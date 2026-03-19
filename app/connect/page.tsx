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

  const saveLeads = (data: any) => {
    localStorage.setItem("uploadedLeads", JSON.stringify(data));
    localStorage.setItem("dataMode", "uploaded");
  };

  const saveDeals = (data: any) => {
    localStorage.setItem("uploadedDeals", JSON.stringify(data));
  };

  const handleUseSample = () => {
    setLoading(true);

    setTimeout(() => {
      saveLeads(leads);
      router.push("/");
    }, 1200);
  };

  const handleLeadsUpload = async (file: File) => {
    setLoading(true);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const normalized = normalizeImportedRows(rows);
    saveLeads(normalized);
    router.push("/");
  };

  const handleDealsUpload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    saveDeals(rows);
    alert("Deals uploaded successfully");
  };

  const handleGoogleSheet = async () => {
    setLoading(true);

    const csvUrl = googleSheetUrlToCsvUrl(sheetUrl);
    const res = await fetch(csvUrl);
    const text = await res.text();

    const workbook = XLSX.read(text, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const normalized = normalizeImportedRows(rows);
    saveLeads(normalized);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-semibold mb-4">
          Import your pipeline
        </h1>

        {!loading && (
          <div className="space-y-4">

            <button
              onClick={handleUseSample}
              className="w-full border p-4 rounded-xl text-left"
            >
              Use sample data
            </button>

            <label className="block border p-4 rounded-xl cursor-pointer">
              Upload Leads CSV
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleLeadsUpload(e.target.files[0])
                }
              />
            </label>

            <label className="block border p-4 rounded-xl cursor-pointer">
              Upload Deals CSV
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleDealsUpload(e.target.files[0])
                }
              />
            </label>

            <input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Google Sheet URL"
              className="w-full border p-3 rounded"
            />

            <button
              onClick={handleGoogleSheet}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Import Google Sheet
            </button>

          </div>
        )}

        {loading && <p>Analyzing data...</p>}

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </main>
  );
}
