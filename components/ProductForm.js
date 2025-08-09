import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { database } from '../db/database';

export default function ProductForm({ existingProduct, onClose }) {
  const [name, setName] = useState(existingProduct?.name || '');
  const [hsn, setHsn] = useState(existingProduct?.hsn || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [gstPercent, setGstPercent] = useState(existingProduct?.gst_percent?.toString() || '');

  const saveProduct = async () => {
    await database.write(async () => {
      if (existingProduct) {
        await existingProduct.update(p => {
          p.name = name;
          p.hsn = hsn;
          p.price = parseFloat(price);
          p.gst_percent = parseFloat(gstPercent);
        });
      } else {
        await database.collections.get('products').create(p => {
          p.name = name;
          p.hsn = hsn;
          p.price = parseFloat(price);
          p.gst_percent = parseFloat(gstPercent);
        });
      }
    });
    onClose();
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Product Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="HSN" value={hsn} onChangeText={setHsn} style={styles.input} />
      <TextInput placeholder="Price" inputMode="decimal" value={price} onChangeText={setPrice} style={styles.input} />
      <TextInput placeholder="GST %" inputMode="numeric" value={gstPercent} onChangeText={setGstPercent} style={styles.input} />
      <Button title="Save" onPress={saveProduct} />
      <Button title="Cancel" onPress={onClose} color="grey" />
    </View>
  );
}
const styles = StyleSheet.create({ container:{padding:20, backgroundColor:'#ddd'}, input:{borderWidth:1,borderColor:'#ccc',marginBottom:10,padding:8,borderRadius:5} });
