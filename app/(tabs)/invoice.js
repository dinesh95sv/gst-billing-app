import { Ionicons } from '@expo/vector-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { useNavigation } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../db/database';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { showToast } from '../../utils/utils';

function InvoicesScreenBase({ invoices }) {
  const navigation = useNavigation();
  

  // const [modalVisible, setModalVisible] = React.useState(false);
  // const [editing, setEditing] = React.useState(null);
  const [invoiceList, setInvoicesList] = React.useState([]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const invoiceData = await database.collections.get('invoices').query().fetch();
      setInvoicesList([ ...invoiceData ]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    (async () => {
      const invoiceData = await database.collections.get('invoices').query().fetch();
      setInvoicesList([ ...invoiceData ]);
    })();
  }, []);

  const deleteInvoice = async (invoice) => {
    Alert.alert('Delete Invoice?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await database.write(async () => { await invoice.destroyPermanently(); });
          showToast('Invoice Deleted Successfully!');
        } catch {
          showToast('Error Deleting Invoice!');
        }
      }}
    ]);
  };

  const shareInvoice = async (invoice) => {
    const uri = await generateInvoicePDF(invoice);
    if (uri != null) {
      await Sharing.shareAsync(uri);
    }
  };

  const redirectToCreateInvoice = (invoiceNo) => {
    if (invoiceNo != null) {
      navigation.navigate('index', { existingInvoice: invoiceNo });
    } else {
      navigation.navigate('index');
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          style="dark"
          hidden={false}
        />
        <View  style={styles.scrollView}>
          <Text style={styles.title}>Invoices</Text>
          <ScrollView>
            {invoiceList.map(inv => (
              <View key={inv.id} style={styles.card}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.name}>{inv.invoice_number}</Text>
                </View>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                  <View style={styles.details}>
                    <Text>Date: {inv.date}</Text>
                    <Text>Total: ₹{inv.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => shareInvoice(inv)}
                    >
                      {/* <Text style={[styles.actionText, { color: 'green' }]}>Share</Text> */}
                      <Ionicons name="share" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => { redirectToCreateInvoice(inv.invoice_number) }}
                    >
                      {/* <Text style={styles.actionText}>Edit</Text> */}
                      <Ionicons name="pencil" size={24} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => deleteInvoice(inv)}
                    >
                      {/* <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text> */}
                      <Ionicons name="trash-bin" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnPrimary} 
            onPress={() => redirectToCreateInvoice(null) }
          >
            <Ionicons name="add-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const enhance = withObservables([], () => ({
  invoices: database.collections.get('invoices').query().observe()
}));
export default enhance(InvoicesScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff', color: '#000' },
  scrollView: { flex: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { 
    flex: 0.2,
    flexDirection: 'column',
    backgroundColor: '#f7f7f7',
    color: '#000',
    padding: 10, 
    marginVertical: 5, 
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderStyle: 'solid', 
    borderRadius: 6 
  },
  details: { flex: 0.8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  actions: { flex: 0.2, justifyContent: 'center', alignItems: 'flex-end' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: 'blue', fontWeight: '500' },
  btnContainer: { flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'right' },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#39e39f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
