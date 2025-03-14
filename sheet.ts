import ExcelJS from "exceljs";
import path from "path";

export async function createExcelSheet(
  data: Record<string, any>[],
  outputPath = "output.xlsx"
) {
  try {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    // If there's no data, just create an empty sheet
    if (!data || data.length === 0) {
      await workbook.xlsx.writeFile(outputPath);
      console.log(`Empty file created at ${outputPath}`);
      return;
    }
    
    // Extract headers from first data object
    const headers = Object.keys(data[0]);
    
    // Add header row with basic styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' } // Light gray
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
    });
    
    // Add data rows
    data.forEach(item => {
      const row = worksheet.addRow(headers.map(header => item[header]));
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Auto-size columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      // @ts-ignore
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });
    
    // Save to file
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel file created at ${outputPath}`);
  } catch (error) {
    console.error("Error creating Excel file:", error);
    throw error;
  }
}

// Example usage
const sampleData = [
  { name: "John Doe", age: 30, email: "john@example.com" },
  { name: "Jane Smith", age: 25, email: "jane@example.com" },
  { name: "Mike Johnson", age: 45, email: "mike@example.com" },
];

createExcelSheet(sampleData, "output.xlsx");
