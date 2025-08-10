import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
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
    <View style={styles.modalContainer}>
      <TextInput placeholder="Product Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="HSN" value={hsn} onChangeText={setHsn} style={styles.input} />
      <TextInput placeholder="Price" inputMode="decimal" value={price} onChangeText={setPrice} style={styles.input} />
      <TextInput placeholder="GST %" inputMode="numeric" value={gstPercent} onChangeText={setGstPercent} style={styles.input} />
      {/* <Button title="Save" onPress={saveProduct} />
      <Button title="Cancel" onPress={onClose} color="grey" /> */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.btnSecondary} 
          onPress={onClose}
        >
          <Text style={styles.label}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={saveProduct}
        >
          <Text style={styles.label}>Save Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer:{flex: 1, padding:20, backgroundColor:'#80eded', color: '#000'},
  input:{borderWidth:1,borderColor:'#ccc',marginBottom:10,padding:8,borderRadius:5},
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
  btnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#bdbdbd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
