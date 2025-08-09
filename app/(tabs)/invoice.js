import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, Alert, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db/database';
// import InvoiceForm from '../../components/InvoiceForm';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import * as Sharing from 'expo-sharing';

function InvoicesScreenBase({ invoices }) {
  const router = useRouter();

  // const [modalVisible, setModalVisible] = React.useState(false);
  // const [editing, setEditing] = React.useState(null);

  const deleteInvoice = async (invoice) => {
    Alert.alert('Delete Invoice?', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: async () => {
        await database.write(async () => { await invoice.destroyPermanently(); });
      }}
    ]);
  };

  const shareInvoice = async (invoice) => {
    const uri = await generateInvoicePDF(invoice);
    await Sharing.shareAsync(uri);
  };

  const redirectToCreateInvoice = (inv) => {
    if (inv != null) {
      router.replace({
        pathname: '/index',
        params: {
          existingInvoice: inv,
        }
      })
    } else {
      router.replace({
        pathname: '/index',
      });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Invoices</Text>
        {invoices.map(inv => (
          <View key={inv.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{inv.invoice_number}</Text>
              <Text>Date: {inv.date}</Text>
              <Text>Total: ₹{inv.total.toFixed(2)}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => shareInvoice(inv)}>
                <Text>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { redirectToCreateInvoice(inv) }}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteInvoice(inv)}>
                <Text>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Button title="➕ Add Invoice" onPress={() => { redirectToCreateInvoice(null) }} />
      </ScrollView>
    </View>
  );
}

const enhance = withObservables([], () => ({
  invoices: database.collections.get('invoices').query().observe()
}));
export default enhance(InvoicesScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', padding: 10, marginVertical: 5, borderRadius: 5 },
  name: { fontWeight: 'bold' }
});
