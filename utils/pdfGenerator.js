import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { database } from '../db/database';

/**
 * Generates a PDF for a given WatermelonDB invoice model.
 * @param {Model} invoice WatermelonDB invoice instance
 * @returns {Promise<string>} File URI of the generated PDF
 */
export async function generateInvoicePDF(invoice) {
  // Fetch related data
  const customer = await database.collections
    .get('customers')
    .find(invoice.customer_id);
  const factory = await database.collections
    .get('factories')
    .find(invoice.factory_id);
  const items = JSON.parse(invoice.items_json || '[]');

  // Build HTML for invoice
    const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        h1, h2, h3 { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
        th { background-color: #f2f2f2; text-align: center; }
        .header-table td { border: none; padding: 2px; }
        .section-title { background-color: #e0e0e0; font-weight: bold; padding: 4px;}
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .no-border td { border: none; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td>
            <h2>${factory.name}</h2>
            ${factory.address || ''}<br/>
            GSTIN: ${factory.gstin}<br/>
            Contact: ${factory.contact || ''}
          </td>
          <td style="text-align:right">
            <h1>Tax Invoice</h1>
            Invoice No: <strong>${invoice.invoice_number}</strong><br/>
            Date: ${invoice.date}
          </td>
        </tr>
      </table>

      <!-- Bill To / Ship To -->
      <table class="header-table" style="margin-top:10px;">
        <tr>
          <td>
            <div class="section-title">BILL TO</div>
            ${customer.name}<br/>
            ${customer.address || ''}<br/>
            GSTIN: ${customer.gstin}
          </td>
          <td>
            <div class="section-title">SHIP TO</div>
            ${customer.name}<br/>
            ${customer.address || ''}<br/>
            GSTIN: ${customer.gstin}
          </td>
        </tr>
      </table>

      <!-- Items -->
      <table style="margin-top: 15px;">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Taxable Value</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => {
            const taxable = it.price * it.quantity;
            const sgst = (taxable * (it.gst_percent/2) / 100);
            const cgst = sgst; // equal split
            return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${it.name}</td>
                <td class="text-center">${it.hsn || ''}</td>
                <td class="text-center">${it.quantity}</td>
                <td class="text-right">₹${it.price.toFixed(2)}</td>
                <td class="text-right">₹${taxable.toFixed(2)}</td>
                <td class="text-right">₹${sgst.toFixed(2)}</td>
                <td class="text-right">₹${cgst.toFixed(2)}</td>
                <td class="text-right">₹${it.total.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="margin-top:10px;">
        <tr>
          <td class="text-right" style="font-weight:bold;">GST Amount</td>
          <td class="text-right">₹${invoice.gst_breakup.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="text-right" style="font-weight:bold;">Grand Total</td>
          <td class="text-right">₹${Math.round(invoice.total).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Declaration -->
      <div style="margin-top:20px; font-size:11px;">
        <strong>Declaration:</strong> Certified that the particulars given above are true and correct and that the amount indicated represents the price actually charged and that there is no additional consideration.
      </div>

      <!-- Signature -->
      <div style="margin-top:40px; text-align:right;">
        <div style="border-top:1px solid #000; display:inline-block; padding-top:5px;">
          Authorised Signatory
        </div>
      </div>

      <div style="margin-top:20px; text-align:center; font-size:10px;">
        This is a system generated invoice.
      </div>
    </body>
  </html>
  `;


  // Create PDF from HTML
  const { uri } = await Print.printToFileAsync({ html });

  // Target path in app's document directory
  const fileName = `${invoice.invoice_number}.pdf`;
  const appDocPath = `${FileSystem.documentDirectory}${fileName}`;

  // Move file to app documents
  await FileSystem.moveAsync({
    from: uri,
    to: appDocPath
  });

  // Save to Downloads if Android permission granted
  try {
    const perm = await MediaLibrary.getPermissionsAsync();
    if (perm.status === 'granted') {
      const asset = await MediaLibrary.createAssetAsync(appDocPath);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      console.log('✅ Saved to Downloads');
    } else {
      console.log('⚠️ Could not save to Downloads (permission denied)');
    }
  } catch (err) {
    console.log('Saving to Downloads failed:', err);
  }

  return appDocPath; // return internal file path
}
