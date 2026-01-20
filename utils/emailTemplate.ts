import { Business, Doc } from '../types';

export const generateEmailHtml = (content: string, business: Business, doc?: Doc) => {
  const primaryColor = business.settings?.primaryColor || '#2563eb';
  const logoUrl = business.settings?.logoUrl;
  const businessName = business.name || 'Your Business';

  // Simple HTML escape
  const escape = (str: string | number | undefined) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const escapedContent = escape(content);
  const formattedContent = escapedContent.replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escape(businessName)} - Document</title>
  <style type="text/css">
    /* Client-specific fixes */
    u + .body .gmail-fix { display: none !important; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: none !important; }
      .content-padding { padding: 24px 20px !important; }
      .header-padding { padding: 24px 20px !important; }
      .footer-padding { padding: 24px 20px !important; }
      .summary-cell { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
      .summary-cell:last-child { padding-bottom: 0 !important; }
    }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body, .outer { background-color: #1e293b !important; }
      .main { background-color: #0f172a !important; }
      .content, .footer { color: #e2e8f0 !important; }
      .highlight-box { background-color: #1e293b !important; border-left-color: ${primaryColor} !important; }
      .text-muted { color: #94a3b8 !important; }
      .text-bold { color: #f1f5f9 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:Arial,Helvetica,sans-serif;" class="body">
  <!-- Gmail fix -->
  <div class="gmail-fix" style="white-space:nowrap; font:15px courier; line-height:0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;" class="outer">
    <tr>
      <td align="center">
        <!--[if mso]>
        <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
          <tr>
            <td align="center" bgcolor="#ffffff" style="border-radius:16px; overflow:hidden;">
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" style="width:600px; height:100%; v-text-anchor:middle;" arcsize="8%" stroke="f" fillcolor="#ffffff">
                <v:fill opacity="0%" color="#ffffff"/>
                <v:shadow on="t" color="#00000020" offset="0,4px" opacity="20%"/>
                <w:anchorlock/>
                <center>
        <![endif]-->

        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="container" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${primaryColor}" style="padding:24px 20px;" class="header-padding">
              ${logoUrl
      ? `<img src="${escape(logoUrl)}" alt="${escape(businessName)} Logo" width="180" style="max-width:180px; height:auto; border:0;" />`
      : `<h1 style="margin:0; font-size:24px; font-weight:bold; color:#ffffff; letter-spacing:-0.5px;">${escape(businessName)}</h1>`
    }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px; background:#ffffff; font-size:16px; line-height:1.6; color:#334155;" class="content content-padding">
              <div style="margin-bottom:20px;">${formattedContent}</div>

              ${doc ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9; border-radius:12px; border-left:4px solid ${primaryColor}; margin:24px 0;" class="highlight-box">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 12px 0; font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:0.8px; color:#64748b;">Document Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" class="summary-cell" style="vertical-align:top;">
                          <div style="font-size:12px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-bottom:4px;">Type</div>
                          <div style="font-size:16px; color:#1e293b; font-weight:600;" class="text-bold">${escape(doc.type)}</div>
                        </td>
                        <td width="50%" class="summary-cell" style="vertical-align:top;">
                          <div style="font-size:12px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-bottom:4px;">Number</div>
                          <div style="font-size:16px; color:#1e293b; font-weight:600;" class="text-bold">${escape(doc.number)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" class="summary-cell" style="vertical-align:top;">
                          <div style="font-size:12px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-bottom:4px;">Date</div>
                          <div style="font-size:16px; color:#1e293b; font-weight:600;" class="text-bold">${escape(doc.date)}</div>
                        </td>
                        <td width="50%" class="summary-cell" style="vertical-align:top;">
                          <div style="font-size:12px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-bottom:4px;">Total Amount</div>
                          <div style="font-size:16px; color:#1e293b; font-weight:600;" class="text-bold">${escape(doc.currency)} ${Number(doc.total).toFixed(2)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <div style="padding:16px 20px; background:#f0f9ff; border-radius:12px; text-align:center; border-left:4px solid ${primaryColor}; margin-top:24px;">
                <p style="margin:0; font-size:15px; color:#0369a1; line-height:1.5;">
                  <strong>Please find the attached document</strong> for your records.<br>
                  If you have any questions, simply reply to this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:14px; color:#64748b;" class="footer footer-padding">
              <div style="font-size:16px; font-weight:bold; color:#1e293b; margin-bottom:6px;">${escape(businessName)}</div>
              ${business.address ? `<div style="margin:4px 0;">${escape(business.address)}</div>` : ''}
              ${(business.phone || business.email) ? `
              <div style="margin:6px 0;">
                ${business.phone ? `${escape(business.phone)}` : ''}
                ${business.phone && business.email ? ' • ' : ''}
                ${business.email ? `<a href="mailto:${escape(business.email)}" style="color:${primaryColor}; text-decoration:none;">${escape(business.email)}</a>` : ''}
              </div>
              ` : ''}
              <div style="margin-top:16px; font-size:12px; color:#94a3b8;">
                Powered by <strong>BizDocs AI</strong>
              </div>
            </td>
          </tr>
        </table>

        <!--[if mso]>
                </center>
              </v:roundrect>
            </td>
          </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};