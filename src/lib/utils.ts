import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AssetItem } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(assets: AssetItem[]) {
  const headers = ["Fecha", "Lugar", "Categoría", "Fabricante", "Modelo", "Serial", "Estado"];
  const rows = assets.map(asset => [
    asset.timestamp,
    asset.location,
    asset.category,
    asset.manufacturer,
    asset.model,
    asset.serial,
    asset.state
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
