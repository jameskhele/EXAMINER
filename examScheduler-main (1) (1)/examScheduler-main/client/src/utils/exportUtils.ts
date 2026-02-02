import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPdf = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  const tableHeaders = Object.keys(data[0]);
  const tableData = data.map(row => Object.values(row).map(String));

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`${fileName}.pdf`);
};
