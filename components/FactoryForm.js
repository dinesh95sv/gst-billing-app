import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { database } from '../db/database';

export default function FactoryForm({ existingFactory, onClose }) {
  const [name, setName] = useState(existingFactory?.name || '');
  const [address, setAddress] = useState(existingFactory?.address || '');
  const [contact, setContact] = useState(existingFactory?.contact || '');
  const [gstin, setGstin] = useState(existingFactory?.gstin || '');

  const saveFactory = async () => {
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
    onClose();
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="Contact" value={contact} inputMode="numeric" maxLength={10} onChangeText={setContact} style={styles.input} />
      <TextInput placeholder="GSTIN" value={gstin} onChangeText={setGstin} style={styles.input} />
      <Button title="Save" onPress={saveFactory} />
      <Button title="Cancel" onPress={onClose} color="grey" />
    </View>
  );
}
const styles = StyleSheet.create({ container:{padding:20, backgroundColor:'#ddd'}, input:{borderWidth:1,borderColor:'#ccc',marginBottom:10,padding:8,borderRadius:5} });
