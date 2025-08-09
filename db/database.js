import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';

// Import model classes
import Product from './models/Product';
import Customer from './models/Customer';
import Factory from './models/Factory';
import Invoice from './models/Invoice';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // Use JSI for faster performance
});

export const database = new Database({
  adapter,
  modelClasses: [Product, Customer, Factory, Invoice],
  actionsEnabled: true, 
});
