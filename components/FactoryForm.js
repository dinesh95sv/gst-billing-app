import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database } from '../db/database';
import { showToast } from '../utils/utils';

export default function FactoryForm({ existingFactory, onClose }) {
  const [name, setName] = useState(existingFactory?.name || '');
  const [address, setAddress] = useState(existingFactory?.address || '');
  const [contact, setContact] = useState(existingFactory?.contact || '');
  const [gstin, setGstin] = useState(existingFactory?.gstin || '');

  const saveFactory = async () => {
    try {
      await database.write(async () => {
        if (existingFactory) {
          await existingFactory.update(f => {
            f.name = name;
            f.address = address;
            f.contact = contact;
            f.gstin = gstin;
          });
        } else {
          await database.collections.get('factories').create(f => {
            f.name = name;
            f.address = address;
            f.contact = contact;
            f.gstin = gstin;
          });
        }
      });
      showToast('Factory Created Successfully');
      onClose();
    } catch {
      showToast('Failed to Create Factory!');
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.label}>Name</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <Text style={styles.label}>Address</Text>
      <TextInput placeholder="Address" value={address} multiline={true} numberOfLines={4} onChangeText={setAddress} style={styles.inputMultiline} />
      <Text style={styles.label}>Contact</Text>
      <TextInput placeholder="Contact" value={contact} inputMode="numeric" maxLength={10} onChangeText={setContact} style={styles.input} />
      <Text style={styles.label}>GSTIN</Text>
      <TextInput placeholder="GSTIN" value={gstin} onChangeText={setGstin} style={styles.input} />
      {/* <Button title="Save" onPress={saveFactory} />
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
          onPress={saveFactory}
        >
          <Text style={styles.label}>Save Factory</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer:{flex: 1, padding:20, backgroundColor:'#fff', color: '#000'},
  label: { fontWeight: 'bold', marginTop: 10, color: '#000' },
  input:{borderWidth:1,borderColor:'#807f7f',backgroundColor:'#edf4ff',color: '#000',marginBottom:10,padding:8,borderRadius:5},
  inputMultiline:{borderWidth:1,borderColor:'#807f7f',backgroundColor:'#edf4ff',color: '#000', textAlignVertical: 'top', marginBottom:10,padding:8,borderRadius:5},
  btnContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'right' },
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
