import { Ionicons } from '@expo/vector-icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../db/database';
import { showToast } from '../../utils/utils';

const InvoiceForm = ({ customers, factories, products }) => {
    const navigation = useNavigation();
    const router = useRouter();

  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [existingInvoice, setExistingInvoice] = useState(null);

  const [customerId, setCustomerId] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].split('-').reverse().split('-'));
  const [items, setItems] = useState([]);

  const getInvoiceDetails = async () => {
    try {
      const invoiceResults = await database.collections.get('invoices').query(Q.where('invoice_number', invoiceNumber)).fetch();
      const invoiceDetail = invoiceResults[0] || null
      setExistingInvoice(invoiceDetail);
      if (invoiceDetail !== null) {
        setCustomerId(invoiceDetail?.customer_id || '');
        setFactoryId(invoiceDetail?.factory_id || '');
        setDate(invoiceDetail?.date || new Date().toISOString().split('T')[0].split('-').reverse().split('-'));
        setItems(invoiceDetail ? [ ...JSON.parse(invoiceDetail?.items_json || '[]') ] : []);
      }
    } catch {
      console.log('Error Fetching Invoice');
      showToast('Error Fetching Invoice');
    }
  };

  useEffect(() => {
    if (invoiceNumber !== null) {
      getInvoiceDetails();
    }
  }, [invoiceNumber]);

  useEffect(() => {
    setInvoiceNumber(router?.params?.invoiceNumber || null);
  }, [router]);

  const updateQuantity = (productId, qty) => {
    if (qty <= 1000000) { // Only allow upto 10 Lakh Quantity.
      if (qty !== 0) {
        setItems(items.map(it => it.productId === productId 
          ? { 
              ...it,
              quantity: qty,
              total: ((it.price * qty) + ((it.price * qty) * it.gstPercent / 100))
            } 
          : it
        ));
      } else {
        setItems(items.map(it => it.productId === productId 
          ? { 
              ...it, 
              quantity: 0, 
              total: 0
            } 
          : it
        ));
      }
    }
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
    try {
      const gstBreakup = items.reduce((acc, it) => acc + ((it.price * it.quantity) * it.gstPercent / 100), 0);
      const total = items.reduce((acc, it) => acc + it.total, 0);
      // const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
      const newDate = new Date();
      const formattedDate = new Date().toISOString.split('T')[0].split('-').reverse().join('-');
       const year = newDate.getFullYear().toString();
      const monthNo = newDate.getMonth() + 1;
      const month = monthNo.toString().padStart(2, "0");
      const dateStr = newDate.getDate().toString().padStart(2, "0");
      const hrs = newDate.getHours().toString().padStart(2, "0");
      const mins = newDate.getMinutes().toString().padStart(2, "0");
      const invoiceNo = `INV-${year}${month}${dateStr}${hrs}${mins}`;

      await database.write(async () => {
        if (existingInvoice != null) {
          await existingInvoice.update(inv => {
            inv.invoice_number = existingInvoice.invoice_number;
            inv.date = formattedDate;
            inv.customer_id = customerId;
            inv.factory_id = factoryId;
            inv.items_json = JSON.stringify(items);
            inv.gst_breakup = gstBreakup;
            inv.total = total;
          });
        } else {
          await database.collections.get('invoices').create(inv => {
            inv.invoice_number = invoiceNo;
            inv.date = formattedDate;
            inv.customer_id = customerId;
            inv.factory_id = factoryId;
            inv.items_json = JSON.stringify(items);
            inv.gst_breakup = gstBreakup;
            inv.total = total;
          });
        }
      });
      showToast(`Invoice ${existingInvoice != null ? 'Updated' : 'Created' } Successfully!`);
      navigation.navigate('invoice');
    } catch {
      showToast(`Failed to ${existingInvoice != null ? 'Update' : 'Create' } Invoice!`);
    }
    
  };

  const onReset = () => {
    setCustomerId(existingInvoice?.customer_id || '');
    setFactoryId(existingInvoice?.factory_id || '');
    setDate(existingInvoice?.date || new Date().toISOString().split('T')[0].split('-').reverse().join('-'));
    setItems(existingInvoice ? JSON.parse(existingInvoice.items_json) : []);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          style="dark"
          hidden={false}
        />
        <ScrollView style={styles.scrollView}>
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
              <Picker selectedValue={factoryId} style={styles.dropdown} onValueChange={setFactoryId}>
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
              {items.length > 0 ? (<Text style={styles.label}>Items in Invoice:</Text>): null}
              {items.map(it => (
                <View key={it.productId} style={styles.itemRow}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 0.6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.label}>{it.name}</Text>
                    </View>
                    <View style={{ flex: 0.4, flexDirection: 'column' }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text>Qty:</Text>
                        <TextInput
                          style={styles.input}
                          value={it.quantity.toFixed(0)}
                          onChangeText={(v) => updateQuantity(it.productId, (parseInt(v) || 0))}
                        />
                      </View>
                      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text>Total: </Text>
                        <Text>₹{it.total.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.btnContainer}>
                    <TouchableOpacity
                      style={styles.btnSecondary} 
                      onPress={() => removeItem(it.productId)}
                    >
                      <Ionicons name="close-sharp" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.itemRow}>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={styles.label}>GST Total: ₹{items.reduce((acc, it) => acc + ((it.price * it.quantity) * it.gstPercent / 100), 0)}</Text>
                  <Text style={styles.label}>Invoice Total: ₹{items.reduce((acc, it) => acc + it.total, 0)}</Text>
                </View>
              </View>
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
                disabled={!customerId || !factoryId || items.length === 0 || items.filter(item => item.quantity === 0).length > 0}
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

const enhance = withObservables([], () => ({
  customers: database.collections.get('customers').query().observe(),
  factories: database.collections.get('factories').query().observe(),
  products: database.collections.get('products').query().observe(),
}));
export default enhance(InvoiceForm);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff', color: '#000' },
  scrollView: { flex: 1 },
  content: { flexDirection: 'column' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  dropdown: { backgroundColor: '#edf4ff', borderWidth:1, borderColor:'#807f7f', color: '#000' },
  itemRow: { flex: 1, flexDirection: 'column' },
  input:{borderWidth:1,borderColor:'#807f7f',backgroundColor:'#edf4ff',color: '#000',marginBottom:10,padding:8,borderRadius:5},
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
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
