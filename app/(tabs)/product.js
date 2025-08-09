import React from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db/database';
import ProductForm from '../../components/ProductForm';

function ProductsScreenBase({ products }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const deleteProduct = async (product) => {
    Alert.alert('Delete?', 'Confirm delete product?', [
      { text: 'Cancel' },
      { text: 'Yes', onPress: async () => {
        await database.write(async () => { await product.destroyPermanently(); });
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Products</Text>
        {products.map(prod => (
          <View key={prod.id} style={styles.card}>
            <View style={{ flex:1 }}>
              <Text style={styles.name}>{prod.name}</Text>
              <Text>HSN: {prod.hsn}</Text>
              <Text>₹{prod.price} + {prod.gstPercent}% GST</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => { setEditing(prod); setModalVisible(true); }}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(prod)}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Button title="➕ Add Product" onPress={() => { setEditing(null); setModalVisible(true); }} />
      </ScrollView>
      <Modal visible={modalVisible}>
        <ProductForm existingProduct={editing} onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
}
const enhance = withObservables([], () => ({
  products: database.collections.get('products').query().observe()
}));
export default enhance(ProductsScreenBase);
const styles = StyleSheet.create({container:{flex:1, padding:12, backgroundColor:'#ddd'}, title:{fontSize:20,fontWeight:'bold'}, card:{backgroundColor:'#eee',padding:10,marginVertical:5,borderRadius:5},name:{fontWeight:'bold'}});
