// app/db/models/Invoice.js
import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export default class Invoice extends Model {
  static table = 'invoices';

  @field('invoice_number') invoiceNumber;
  @field('date') date;                       // e.g., "2025-08-09"
  @field('customer_id') customerId;          // FK to customers table
  @field('factory_id') factoryId;            // FK to factories table
  @field('items_json') itemsJson;             // JSON stringified array of line items
  @field('gst_breakup') gstBreakup;           // Number, total GST amount
  @field('total') total;                      // Number, invoice gross total
  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt

  // Optionally provide parsed items getter/setter
  get items() {
    try {
      return JSON.parse(this.itemsJson);
    } catch {
      return [];
    }
  }

  set items(itemsArray) {
    this.itemsJson = JSON.stringify(itemsArray);
  }
}
