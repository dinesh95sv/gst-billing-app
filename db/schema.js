import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'hsn', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'gst_percent', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'customers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'gstin', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'factories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'contact', type: 'string', isOptional: true },
        { name: 'gstin', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'invoices',
      columns: [
        { name: 'invoice_number', type: 'string' },
        { name: 'date', type: 'string' },
        { name: 'customer_id', type: 'string' },
        { name: 'factory_id', type: 'string' },
        { name: 'items_json', type: 'string' }, // store array as JSON
        { name: 'gst_breakup', type: 'number' },
        { name: 'total', type: 'number' },
      ],
    }),
  ],
});
