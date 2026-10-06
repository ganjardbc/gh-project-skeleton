import * as XLSX from 'xlsx';

interface ExportOptions {
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 */
export function exportToExcel(
  data: Record<string, any>[],
  options: ExportOptions
) {
  const { filename, sheetName = 'Sheet1' } = options;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write the file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
