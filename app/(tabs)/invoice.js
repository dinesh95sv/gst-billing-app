import { withObservables } from '@nozbe/watermelondb/react';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../../db/database';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { showToast } from '../../utils/utils';

function InvoicesScreenBase({ invoices }) {
  const navigation = useNavigation();

  // const [modalVisible, setModalVisible] = React.useState(false);
  // const [editing, setEditing] = React.useState(null);

  const deleteInvoice = async (invoice) => {
    Alert.alert('Delete Invoice?', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: async () => {
        try {
          await database.write(async () => { await invoice.destroyPermanently(); });
        } catch (err) {
          showToast('Error Deleting Invoice!');
        }
      }}
    ]);
  };

  const shareInvoice = async (invoice) => {
    const uri = await generateInvoicePDF(invoice);
    await Sharing.shareAsync(uri);
  };

  const redirectToCreateInvoice = (inv) => {
    if (inv != null) {
      navigation.navigate('index', {existingInvoice: inv});
    } else {
      navigation.navigate('index');
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Invoices</Text>
          {invoices.map(inv => (
            <View key={inv.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{inv.invoiceNumber}</Text>
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
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => shareInvoice(inv)}
                >
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => { redirectToCreateInvoice(inv) }}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => deleteProduct(prod)}
                >
                  <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnPrimary} 
            onPress={() => redirectToCreateInvoice(null) }
          >
            <Text style={styles.label}>Add Invoice</Text>
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
  container: { flex: 1, padding: 12, backgroundColor: '#80eded', color: '#000' },
  scrollView: { flex: 1, alignItems: 'baseline' },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', padding: 10, marginVertical: 5, borderRadius: 5 },
  name: { fontWeight: 'bold' },
  btnContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'right' },
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
