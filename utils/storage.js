import AsyncStorage from '@react-native-async-storage/async-storage';

// Get all items
export const fetchData = async (key) => {
  return JSON.parse(await AsyncStorage.getItem(key)) || [];
};

// Save or update single item
export const saveItem = async (key, item, idField = 'id') => {
  console.log(key);
  let list = await fetchData(key);
  console.log(key);
  const idx = list.findIndex(x => x[idField] === item[idField]);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  await AsyncStorage.setItem(key, JSON.stringify(list));
  return list;
};

// Delete item
export const deleteItem = async (key, itemId, idField = 'id') => {
  let list = await fetchData(key);
  list = list.filter(x => x[idField] !== itemId);
  await AsyncStorage.setItem(key, JSON.stringify(list));
  return list;
};