import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FactoryForm from '../../components/FactoryForm';
import { database } from '../../db/database';

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="#000000"
          statusBarStyle='light'
          hidden={false}
        />
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Factories</Text>
          {factories.map(fac => (
            <View key={fac.id} style={styles.card}>
              <View style={styles.details}>
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

          {/* <Button 
            title="➕ Add Factory" 
            onPress={() => { setEditingFactory(null); setModalVisible(true); }} 
          /> */}
        </ScrollView>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btnPrimary} 
            onPress={() => { setEditingFactory(null); setModalVisible(true); }}
          >
            <Text style={styles.label}>Add Factory</Text>
          </TouchableOpacity>
        </View>
        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <FactoryForm 
            existingFactory={editingFactory} 
            onClose={() => setModalVisible(false)} 
          />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Enhance with WatermelonDB reactive data
const enhance = withObservables([], () => ({
  factories: database.collections.get('factories').query(Q.sortBy('updatedAt', Q.desc)).observe(),
}));

export default enhance(FactoriesScreenBase);

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
