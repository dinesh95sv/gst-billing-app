import { Ionicons } from '@expo/vector-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CustomerForm from '../../components/CustomerForm';
import { database } from '../../db/database';
import { callMobile, showToast } from '../../utils/utils';

function CustomersScreenBase({ customers }) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState(null);

  const handleDelete = (customer) => {
    Alert.alert('Delete Customer?', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await database.write(async () => { await customer.destroyPermanently(); });
          showToast('Customer Deleted Successfully!');
        } catch {
          showToast('Error Deleting Customer!');
        }
      }}
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          style="light"
          hidden={false}
        />
        <View style={styles.scrollView}>
          <Text style={styles.title}>Customers</Text>
          <ScrollView>
            {customers.map(cust => (
              <View key={cust.id} style={styles.card}>
                <View style={styles.details}>
                  <Text style={styles.name}>{cust.name}</Text>
                  {cust.contact ? (
                    <TouchableOpacity 
                      onPress={() => callMobile(cust.contact )}
                    >
                    <Text>{cust.contact}</Text>
                  </TouchableOpacity>
                  ) : null }
                  <Text>GSTIN: {cust.gstin}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => { setEditingCustomer(cust); setModalVisible(true); }}
                  >
                    {/* <Text style={styles.actionText}>Edit</Text> */}
                    <Ionicons name="pencil" size={24} color="blue" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleDelete(cust)}
                  >
                    {/* <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text> */}
                    <Ionicons name="trash-bin" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {/* <Button title="➕ Add Customer" onPress={() => { setEditingCustomer(null); setModalVisible(true); }} /> */}
          </ScrollView>
        </View>
        <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.btnPrimary} 
              onPress={() => { setEditingCustomer(null); setModalVisible(true); }}
            >
              {/* <Text style={styles.label}>Add Customer</Text> */}
              <Ionicons name="add-outline" size={24} color="white" />
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
  container: { flex: 1, padding: 12, backgroundColor: '#fff', color: '#000' },
  scrollView: { flex: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { 
    flex: 0.2,
    flexDirection: 'row',
    backgroundColor: '#f7f7f7', 
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
