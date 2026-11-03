export async function downloadPdf(result: string, fileName: string): Promise<void> {
  const value = result.trim();

  if (/^https?:\/\//i.test(value)) {
    try {
      const response = await fetch(value);
      if (!response.ok) throw new Error('Failed to download file');
      saveBlob(await response.blob(), fileName);
    } catch {
      window.open(value, '_blank', 'noopener');
    }
    return;
  }

  const base64 = value.replace(/^data:application\/pdf;base64,/i, '');
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  saveBlob(new Blob([bytes], { type: 'application/pdf' }), fileName);
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
