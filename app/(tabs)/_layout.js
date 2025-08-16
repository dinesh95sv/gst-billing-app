import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarActiveBackgroundColor: "#000000",
        tabBarInactiveBackgroundColor: "#000000",
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="customer"
        options={{
          title: 'Customer',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people-sharp' : 'people-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: 'Product',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'basket-sharp' : 'basket-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create Invoice',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pencil-sharp' : 'pencil-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoice"
        options={{
          title: 'Invoices',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'folder-open-sharp' : 'folder-open-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="factory"
        options={{
          title: 'Factories',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'business-sharp' : 'business-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}