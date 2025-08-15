import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { database } from '../db/database';

/**
 * Generates a PDF for a given WatermelonDB invoice model.
 * @param {Model} invoice WatermelonDB invoice instance
 * @returns {Promise<string>} File URI of the generated PDF
 */

const requestStoragePermission = async () => {
    try {
        if (Platform.OS === 'android') {
            const permission = await MediaLibrary.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    'Permission Required',
                    'Storage permission is required to save invoices to your device.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Permission error:', error);
        Alert.alert('Error', 'Failed to request storage permission');
        return false;
    }
};

const ensureBillsDirectoryExists = async () => {
    try {
        let billsPath;

        if (Platform.OS === 'android') {
            // Use the Downloads directory which is accessible
            billsPath = `${FileSystem.documentDirectory}Invoice/`;
        } else {
            // For iOS, use the app's document directory
            billsPath = `${FileSystem.documentDirectory}Invoice/`;
        }

        const dirInfo = await FileSystem.getInfoAsync(billsPath);

        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(billsPath, { intermediates: true });
            console.log('Bills directory created at:', billsPath);
        }

        return billsPath;
    } catch (error) {
        console.error('Error creating Bills directory:', error);
        // Fallback to document directory
        return FileSystem.documentDirectory;
    }
};

const savePDFToDevice = async (pdfUri, fileName) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        return null;
      }

      const billsPath = await ensureBillsDirectoryExists();
      const finalPath = `${billsPath}${fileName}`;
      
      // Copy the PDF to the Bills directory
      await FileSystem.copyAsync({
        from: pdfUri,
        to: finalPath
      });

      console.log('PDF saved to:', finalPath);
      
      // For Android, also try to save to external storage if possible
      if (Platform.OS === 'android') {
        try {
          // Create asset and add to media library
          const asset = await MediaLibrary.createAssetAsync(finalPath);
          const album = await MediaLibrary.getAlbumAsync('Bills');
          
          if (album == null) {
            await MediaLibrary.createAlbumAsync('Bills', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          
          console.log('PDF also saved to device gallery/downloads');
        } catch (mediaError) {
          console.log('Could not save to media library:', mediaError.message);
          // This is not critical, the file is still saved in app directory
        }
      }
      
      return finalPath;
    } catch (error) {
      console.error('Error saving PDF to device:', error);
      Alert.alert('Error', 'Failed to save PDF to device storage');
      return null;
    }
  };

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
    const htmlContent = `
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
        const sgst = (taxable * (it.gstPercent / 2) / 100);
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
    try {
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `${invoice.invoiceNumber}_${timestamp}.pdf`;
      
      // Save to device storage
      const savedPath = await savePDFToDevice(uri, fileName);
      return savedPath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        Alert.alert('Error', 'Failed to generate invoice PDF: ' + error.message);
    }

    return null; // return failure
}
