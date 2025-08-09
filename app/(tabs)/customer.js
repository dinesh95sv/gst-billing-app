import React from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db/database';
import CustomerForm from '../../components/CustomerForm';

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
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Customer List</Text>
        {customers.map(cust => (
          <View key={cust.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cust.name}</Text>
              <Text>GSTIN: {cust.gstin}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => { setEditingCustomer(cust); setModalVisible(true); }}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(cust)}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Button title="➕ Add Customer" onPress={() => { setEditingCustomer(null); setModalVisible(true); }} />
      </ScrollView>
      <Modal visible={modalVisible}>
        <CustomerForm existingCustomer={editingCustomer} onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
}

const enhance = withObservables([], () => ({
  customers: database.collections.get('customers').query().observe(),
}));
export default enhance(CustomersScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor:'#ddd' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 10, backgroundColor: '#eee', marginBottom: 10, borderRadius: 6 },
  name: { fontWeight: 'bold' }
});
