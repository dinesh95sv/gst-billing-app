import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../db/database';

export default function InvoiceForm() {
    const navigation = useNavigation();
    const route = useRouter();
    const existingInvoice = route?.params?.existingInvoice || null;

  const [customers, setCustomers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [products, setProducts] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const loadData = async () => {
      setCustomers(await database.collections.get('customers').query().fetch());
      setFactories(await database.collections.get('factories').query().fetch());
      setProducts(await database.collections.get('products').query().fetch());
    }
    loadData();
    setTimeout(() => {
    setRefreshing(false);
    }, 2000);
  }, []);

  const updateQuantity = (productId, qty) => {
    setItems(items.map(it => it.productId === productId ? { ...it, quantity: qty, total: ((it.price * qty) + ((it.price * qty) * it.gstPercent / 100)) } : it));
  };

  const removeItem = (productId) => {
    setItems(items.filter(it => it.productId !== productId));
  };

  const addProductToInvoice = (productId) => {
    const exists = items.find(i => i.productId === productId);
    if (!exists) {
      const product = products.find(i => i.id === productId) || {};
      if (product) {
        setItems([
          ...items, 
          {
            productId: product.id,
            name: product.name,
            hsn: product.hsn,
            price: product.price,
            gstPercent: product.gst_percent,
            quantity: 1,
            total: product.price + (product.price * product.gst_percent / 100)
          }
        ]);
      }
    }
    // setShowProductList(false);
  };

  const saveInvoice = async () => {
    const gstBreakup = items.reduce((acc, it) => acc + ((it.price * it.quantity) * it.gstPercent / 100), 0);
    const total = items.reduce((acc, it) => acc + it.total, 0);
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

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
        await database.collections.get('invoices').create(inv => {
          inv.invoice_number = invoiceNo;
          inv.date = date;
          inv.customer_id = customerId;
          inv.factory_id = factoryId;
          inv.items_json = JSON.stringify(items);
          inv.gst_breakup = gstBreakup;
          inv.total = total;
        });
      }
    });
    navigation.navigate('invoice');
  };

  const onReset = () => {
    setCustomerId(existingInvoice?.customer_id || '');
    setFactoryId(existingInvoice?.factory_id || '');
    setDate(existingInvoice?.date || new Date().toISOString().split('T')[0]);
    setItems(existingInvoice ? JSON.parse(existingInvoice.items_json) : []);
  }

  return (
    <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>Customer</Text>
          <Picker selectedValue={customerId} style={styles.dropdown} onValueChange={setCustomerId}>
            <Picker.Item label="Select Customer" value="" />
            {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
          </Picker>
        </View>

        <View>
          <Text style={styles.label}>Factory</Text>
          <Picker selectedValue={factoryId} onValueChange={setFactoryId}>
            <Picker.Item label="Select Factory" value="" />
            {factories.map(f => <Picker.Item key={f.id} label={f.name} value={f.id} />)}
          </Picker>
        </View>

        <View>
          <Text style={styles.label}>Invoice Date</Text>
          <TextInput value={date} onChangeText={setDate} style={styles.input} />
        </View>

        <View>
          <Text style={styles.label}>Add Products</Text>
          <Picker selectedValue={""} onValueChange={(prodId) => addProductToInvoice(prodId)}>
            <Picker.Item label="-- Choose Product --" value="" />
            {products.map(f => <Picker.Item key={f.id} label={f.name} value={f.id} />)}
          </Picker>
        </View>

        <View>
        <Text style={styles.label}>Items in Invoice:</Text>
        {items.map(it => (
          <View key={it.productId} style={styles.itemRow}>
            <Text style={{ flex: 1 }}>{it.name}</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="numeric"
              value={it.quantity.toFixed(0)}
              onChangeText={(v) => updateQuantity(it.productId, parseInt(v) || 1)}
            />
            <Text>₹{it.total.toFixed(2)}</Text>
            <Button title="❌" onPress={() => removeItem(it.productId)} />
          </View>
        ))}
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnSecondary} 
            onPress={onReset}
          >
            <Text style={styles.label}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={saveInvoice}
            disabled={!customerId || !factoryId || items.length === 0}
          >
            <Text style={styles.label}>Save Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#80eded', color: '#000' },
  scrollView: { flex: 1, alignItems: 'baseline' },
  content: { flexDirection: 'column' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  dropdown: { backgroundColor: '#edf4ff', borderWidth:1, borderColor:'#ccc'},
  actions: { justifyContent: 'center', alignItems: 'center' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: 'blue', fontWeight: '500' },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  btnContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'right'
  },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#39e39f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  btnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#bdbdbd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
