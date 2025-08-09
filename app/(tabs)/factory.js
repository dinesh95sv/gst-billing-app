import React from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db/database';
import FactoryForm from '../../components/FactoryForm';

// Base functional screen component
function FactoriesScreenBase({ factories }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingFactory, setEditingFactory] = React.useState(null);

  const handleDelete = (factory) => {
    Alert.alert(
      'Delete Factory?',
      'Are you sure you want to delete this factory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            await database.write(async () => {
              await factory.destroyPermanently();
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Factories</Text>
        {factories.map(fac => (
          <View key={fac.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{fac.name}</Text>
              {fac.address ? <Text>{fac.address}</Text> : null}
              {fac.contact ? <Text>Contact: {fac.contact}</Text> : null}
              <Text>GSTIN: {fac.gstin}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => { setEditingFactory(fac); setModalVisible(true); }}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => handleDelete(fac)}
              >
                <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Button 
          title="➕ Add Factory" 
          onPress={() => { setEditingFactory(null); setModalVisible(true); }} 
        />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <FactoryForm 
          existingFactory={editingFactory} 
          onClose={() => setModalVisible(false)} 
        />
      </Modal>
    </View>
  );
}

// Enhance with WatermelonDB reactive data
const enhance = withObservables([], () => ({
  factories: database.collections.get('factories').query().observe(),
}));

export default enhance(FactoriesScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f7f7f7', 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 6 
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  actions: { justifyContent: 'center', alignItems: 'flex-end' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: 'blue', fontWeight: '500' },
});
