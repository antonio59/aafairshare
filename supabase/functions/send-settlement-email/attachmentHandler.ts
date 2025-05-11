
/**
 * Process PDF and CSV attachments for email
 */
export async function processAttachments(
  pdfAttachment: FormDataEntryValue | null,
  csvAttachment: FormDataEntryValue | null,
  year: string,
  month: string
): Promise<{ filename: string; content: string }[]> {
  const attachments = [];
  
  // Convert PDF to base64 for attachment
  if (pdfAttachment instanceof File) {
    console.log("Processing PDF attachment");
    const pdfArrayBuffer = await pdfAttachment.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
    
    attachments.push({
      filename: `settlement_report_${year}_${month}.pdf`,
      content: pdfBase64
    });
  } else {
    console.warn("PDF attachment not provided or not a File");
  }
  
  // Convert CSV to base64 for attachment
  if (csvAttachment instanceof File) {
    console.log("Processing CSV attachment");
    const csvArrayBuffer = await csvAttachment.arrayBuffer();
    const csvBase64 = btoa(String.fromCharCode(...new Uint8Array(csvArrayBuffer)));
    
    attachments.push({
      filename: `expenses_${year}_${month}.csv`,
      content: csvBase64
    });
  } else {
    console.warn("CSV attachment not provided or not a File");
  }
  
  return attachments;
}
