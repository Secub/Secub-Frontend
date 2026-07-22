export function printHtmlDocument(html: string, title = "SECUB") {
  if (typeof window === "undefined") return false;

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return false;

  printWindow.document.title = title;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}
