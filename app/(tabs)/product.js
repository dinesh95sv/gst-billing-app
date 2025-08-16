import { Ionicons } from '@expo/vector-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ProductForm from '../../components/ProductForm';
import { database } from '../../db/database';
import { showToast } from '../../utils/utils';

function ProductsScreenBase({ products }) {
  const navigation = useNavigation();
  const isFocused = navigation.isFocused();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [productsList, setProductsList] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const productsData = await database.collections.get('products').query().fetch();
      setProductsList([ ...productsData ]);
    })();
  }, [products, isFocused]);

  React.useEffect(() => {
    (async () => {
      const productsData = await database.collections.get('products').query().fetch();
      setProductsList([ ...productsData ]);
    })();
  }, []);

  const deleteProduct = async (product) => {
    Alert.alert('Delete?', 'Confirm delete product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
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
        <StatusBar
          style="light"
          hidden={false}
        />
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Products</Text>
          {productsList.map(prod => (
            <View key={prod.id} style={styles.card}>
              <View style={styles.details}>
                <Text style={styles.name}>{prod.name}</Text>
                <Text>HSN: {prod.hsn}</Text>
                <Text>₹{prod.price} + {prod.gst_percent}% GST</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => { setEditing(prod); setModalVisible(true); }}
                >
                  {/* <Text style={styles.actionText}>Edit</Text> */}
                  <Ionicons name="pencil" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => deleteProduct(prod)}
                >
                  {/* <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text> */}
                  <Ionicons name="trash-bin" size={24} color="red" />
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
            {/* <Text style={styles.label}>Add Product</Text> */}
            <Ionicons name="add-outline" size={24} color="white" />
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
  scrollView: { flex: 1 },
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
