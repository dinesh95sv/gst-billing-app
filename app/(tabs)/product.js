import React from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db/database';
import ProductForm from '../../components/ProductForm';
import { showToast } from '../../utils/utils';

function ProductsScreenBase({ products }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const deleteProduct = async (product) => {
    Alert.alert('Delete?', 'Confirm delete product?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: async () => {
        try {
          await database.write(async () => { await product.destroyPermanently(); });
        } catch (err) {
          showToast('Error Deleting Product!');
        }
      }}
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Products</Text>
          {products.map(prod => (
            <View key={prod.id} style={styles.card}>
              <View style={{ flex:1 }}>
                <Text style={styles.name}>{prod.name}</Text>
                <Text>HSN: {prod.hsn}</Text>
                <Text>₹{prod.price} + {prod.gstPercent}% GST</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => { setEditing(prod); setModalVisible(true); }}
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
          {/* <Button title="➕ Add Product" onPress={() => { setEditing(null); setModalVisible(true); }} /> */}
        </ScrollView>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnPrimary} 
            onPress={() => { setEditing(null); setModalVisible(true); }}
          >
            <Text style={styles.label}>Add Product</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={modalVisible}>
          <ProductForm existingProduct={editing} onClose={() => setModalVisible(false)} />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const enhance = withObservables([], () => ({
  products: database.collections.get('products').query().observe()
}));
export default enhance(ProductsScreenBase);
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#80eded', color: '#000' },
  scrollView: { flex: 1, alignItems: 'baseline' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f7f7f7', 
    padding: 10, 
    marginVertical: 5, 
    border: '.5px solid #ddd', 
    borderRadius: 6 
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  actions: { justifyContent: 'center', alignItems: 'flex-end' },
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
