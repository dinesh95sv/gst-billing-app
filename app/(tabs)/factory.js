import { Ionicons } from '@expo/vector-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FactoryForm from '../../components/FactoryForm';
import { database } from '../../db/database';
import { showToast } from '../../utils/utils';

// Base functional screen component
function FactoriesScreenBase({ factories }) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingFactory, setEditingFactory] = React.useState(null);

  const [factoriesList, setFactoriesList] = React.useState([]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const factoryData = await database.collections.get('factories').query().fetch();
      setFactoriesList([ ...factoryData ]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    (async () => {
      const factoryData = await database.collections.get('factories').query().fetch();
      setFactoriesList([ ...factoryData ]);
    })();
  }, []);

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
            try {
              await database.write(async () => { await factory.destroyPermanently(); });
            } catch (err) {
              showToast('Error Deleting Factory!');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          style="light"
          hidden={false}
        />
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Factories</Text>
          {factoriesList.map(fac => (
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
                  {/* <Text style={styles.actionText}>Edit</Text> */}
                  <Ionicons name="pencil" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleDelete(fac)}
                >
                  {/* <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text> */}
                  <Ionicons name="trash-bin" size={24} color="red" />
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
            <Ionicons name="add-outline" size={24} color="white" />
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
  factories: database.collections.get('factories').query().observe(),
}));

export default enhance(FactoriesScreenBase);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#80eded', color: '#000' },
  scrollView: { flex: 10 },
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
