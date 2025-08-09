import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from '../../db/database';
import { useRouter } from 'expo-router';

export default function InvoiceForm({ existingInvoice }) {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState(existingInvoice?.customer_id || '');
  const [factoryId, setFactoryId] = useState(existingInvoice?.factory_id || '');
  const [date, setDate] = useState(existingInvoice?.date || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState(existingInvoice ? JSON.parse(existingInvoice.items_json) : []);

  useEffect(() => {
    (async () => {
      setCustomers(await database.collections.get('customers').query().fetch());
      setFactories(await database.collections.get('factories').query().fetch());
      setProducts(await database.collections.get('products').query().fetch());
    })();
  }, []);

  const addItem = (product) => {
    const exists = items.find(i => i.productId === product.id);
    if (!exists) {
      setItems([...items, { productId: product.id, name: product.name, price: product.price, gstPercent: product.gst_percent, quantity: 1, total: product.price + (product.price * product.gst_percent / 100) }]);
    }
  };

  const updateQuantity = (productId, qty) => {
    setItems(items.map(it => it.productId === productId ? { ...it, quantity: qty, total: ((it.price * qty) + ((it.price * qty) * it.gstPercent / 100)) } : it));
  };

  const removeItem = (productId) => {
    setItems(items.filter(it => it.productId !== productId));
  };

  const onReset = () => {
    setCustomerId(existingInvoice?.customer_id || '');
    setFactoryId(existingInvoice?.factory_id || '');
    setDate(existingInvoice?.date || new Date().toISOString().split('T')[0]);
    setItems(existingInvoice ? JSON.parse(existingInvoice.items_json) : []);
  }

  const onClose = () => {
    router.replace({
      pathname: '/invoices',
    })
  }

  const saveInvoice = async () => {
    const gstBreakup = items.reduce((acc, it) => acc + ((it.price * it.quantity) * it.gstPercent / 100), 0);
    const total = items.reduce((acc, it) => acc + it.total, 0);

    await database.write(async () => {
      if (existingInvoice) {
        await existingInvoice.update(inv => {
          inv.invoice_number = existingInvoice.invoice_number;
          inv.date = date;
          inv.customer_id = customerId;
          inv.factory_id = factoryId;
          inv.items_json = JSON.stringify(items);
          inv.gst_breakup = gstBreakup;
          inv.total = total;
        });
      } else {
        const invoices = await database.collections.get('invoices').query().fetch();
        const nextNumber = `INV-${1000 + invoices.length}`;
        await database.collections.get('invoices').create(inv => {
          inv.invoice_number = nextNumber;
          inv.date = date;
          inv.customer_id = customerId;
          inv.factory_id = factoryId;
          inv.items_json = JSON.stringify(items);
          inv.gst_breakup = gstBreakup;
          inv.total = total;
        });
      }
    });
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer</Text>
      <Picker selectedValue={customerId} onValueChange={setCustomerId}>
        <Picker.Item label="Select Customer" value="" />
        {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
      </Picker>

      <Text style={styles.label}>Factory</Text>
      <Picker selectedValue={factoryId} onValueChange={setFactoryId}>
        <Picker.Item label="Select Factory" value="" />
        {factories.map(f => <Picker.Item key={f.id} label={f.name} value={f.id} />)}
      </Picker>

      <Text style={styles.label}>Invoice Date</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Text style={styles.label}>Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <Button title={item.name} onPress={() => addItem(item)} />
        )}
      />

      <Text style={styles.label}>Items in Invoice:</Text>
      {items.map(it => (
        <View key={it.productId} style={styles.itemRow}>
          <Text style={{ flex: 1 }}>{it.name}</Text>
          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            value={String(it.quantity)}
            onChangeText={(v) => updateQuantity(it.productId, parseInt(v) || 1)}
          />
          <Text>₹{it.total.toFixed(2)}</Text>
          <Button title="❌" onPress={() => removeItem(it.productId)} />
        </View>
      ))}

      <Button title="Save Invoice" onPress={saveInvoice} />
      <Button title="Reset" onPress={onReset} color="grey" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 6, borderRadius: 4, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  qtyInput: { borderWidth: 1, borderColor: '#ccc', width: 50, textAlign: 'center', marginHorizontal: 5 }
});
