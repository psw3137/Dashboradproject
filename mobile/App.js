import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from './src/screens/DashboardScreen';
import CustomersScreen from './src/screens/CustomersScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: '대시보드',
            tabBarLabel: '대시보드',
            tabBarIcon: ({ color }) => (
              <TabIcon name="📊" color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Customers"
          component={CustomersScreen}
          options={{
            title: '고객 목록',
            tabBarLabel: '고객',
            tabBarIcon: ({ color }) => (
              <TabIcon name="👥" color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 간단한 아이콘 컴포넌트
const TabIcon = ({ name, color }) => {
  return (
    <Text style={{ fontSize: 24 }}>{name}</Text>
  );
};
