import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CustomerForm from '../../components/CustomerForm';
import { database } from '../../db/database';

function CustomersScreenBase({ customers }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState(null);

  const handleDelete = (customer) => {
    Alert.alert('Delete?', 'Confirm delete?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: async () => {
        await database.write(async () => {
          await customer.destroyPermanently();
        });
      }}
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Customer List</Text>
          {customers.map(cust => (
            <View key={cust.id} style={styles.card}>
              <View style={styles.details}>
                <Text style={styles.name}>{cust.name}</Text>
                <Text>GSTIN: {cust.gstin}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => { setEditingCustomer(cust); setModalVisible(true); }}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleDelete(cust)}
                >
                  <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* <Button title="➕ Add Customer" onPress={() => { setEditingCustomer(null); setModalVisible(true); }} /> */}
        </ScrollView>
        <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.btnPrimary} 
              onPress={() => { setEditingCustomer(null); setModalVisible(true); }}
            >
              <Text style={styles.label}>Add Customer</Text>
            </TouchableOpacity>
          </View>
        <Modal visible={modalVisible}>
          <CustomerForm existingCustomer={editingCustomer} onClose={() => setModalVisible(false)} />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const enhance = withObservables([], () => ({
  customers: database.collections.get('customers').query().observe(),
}));
export default enhance(CustomersScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#80eded', color: '#000' },
  scrollView: { flex: 1, alignItems: 'baseline' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { 
    flex: 0.2,
    flexDirection: 'row',
    backgroundColor: '#f7f7f7', 
    padding: 10, 
    marginVertical: 5, 
    border: '.5px solid #ddd', 
    borderRadius: 6 
  },
  details: { flex: 0.8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  actions: { flex: 0.2, justifyContent: 'center', alignItems: 'flex-end' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: 'blue', fontWeight: '500' },
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
