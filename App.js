import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { database } from './db/database';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  useEffect(() => {
    (async () => {
      await requestStoragePermission();
      await initialiseDummyData();
    })();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const permission = await MediaLibrary.requestPermissionsAsync();
      console.log(permission.granted
        ? '✅ Storage permission granted' 
        : '⚠️ Storage permission denied');
    }
  };

  const initialiseDummyData = async () => {
    const productsCollection = database.collections.get('products');
    const customersCollection = database.collections.get('customers');
    const factoriesCollection = database.collections.get('factories');
    const invoicesCollection = database.collections.get('invoices');

    const existing = await productsCollection.query().fetch();
    if (existing.length === 0) {
      await database.write(async () => {
        const product = await productsCollection.create(p => {
          p.name = 'Sample Product';
          p.hsn = '1234';
          p.price = 100;
          p.gst_percent = 18;
        });
        const customer = await customersCollection.create(c => {
          c.name = 'DineshKumar S V';
          c.address = '123 Demo Street';
          c.phone = '9876543210';
          c.email = 'dineshkumar@sample.com';
          c.gstin = '22AAAAA0000A1Z5';
        });
        const factory = await factoriesCollection.create(f => {
          f.name = 'Demo Factory';
          f.address = 'Industrial Area, City, State';
          f.contact = 'Factory Contact';
          f.gstin = '33BBBBB1111B2Z6';
        });
        await invoicesCollection.create(inv => {
          const dateStr = new Date().toISOString().split('T')[0];
          inv.invoice_number = `INV-${dateStr}-DUMMY`;
          inv.date = dateStr;
          inv.customer_id = customer.id;
          inv.factory_id = factory.id;
          inv.items_json = JSON.stringify([{
            productId: product.id, 
            name: product.name, 
            hsn: product.hsn,
            quantity: 2, 
            price: product.price, 
            gstPercent: product.gst_percent, 
            total: 236 
          }]);
          inv.gst_breakup = 36;
          inv.total = 236;
        });
      });
      console.log('✅ Dummy data added');
    }
  };
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);