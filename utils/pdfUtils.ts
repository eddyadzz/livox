
/**
 * Constructs a full HTML document string including Tailwind CDN and fonts
 * to be sent to the Puppeteer backend.
 */
const constructFullHTML = (element: HTMLElement) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thaana:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; padding: 0; background-color: #ffffff; }
        :root { font-family: 'Inter', sans-serif; }
        :lang(dv) { font-family: 'Noto Sans Thaana', sans-serif; }
        /* Ensure print container overrides any defaults */
        #printable-clone {
           margin: 0 auto;
           width: 794px;
           min-height: 1123px;
           background: white;
        }
      </style>
    </head>
    <body>
      <div id="printable-clone">
        ${element.innerHTML}
      </div>
    </body>
    </html>
  `;
};

export const generatePdfBlob = async (filename: string): Promise<string | null> => {
  const element = document.getElementById('printable-area');
  if (!element) return null;

  const html = constructFullHTML(element);
  const token = localStorage.getItem('token');

  const res = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ html })
  });

  if (!res.ok) {
      throw new Error('Server-side PDF Generation Failed');
  }

  const blob = await res.blob();
  return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove the data URL prefix to get raw base64
          resolve(base64data.split(',')[1]);
      };
      reader.readAsDataURL(blob);
  });
};

export const downloadPdf = async (filename: string): Promise<void> => {
  const element = document.getElementById('printable-area');
  if (!element) return;

  const html = constructFullHTML(element);
  const token = localStorage.getItem('token');

  const res = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ html })
  });

  if (!res.ok) {
      throw new Error('Server-side PDF Generation Failed');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
