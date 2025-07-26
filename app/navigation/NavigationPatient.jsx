// app/navigation/NavigationPatient.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import DashboardPatient from '../screens/DashboardPatient';
import AgendaPatient from '../screens/AgendaPatient';
import MessageriePatient from '../screens/MessageriePatient';
import BibliothequePatient from '../screens/BibliothequePatient';

const Tab = createBottomTabNavigator();

const NavigationPatient = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Dashboard':
                iconName = 'heart';
                break;
              case 'Agenda':
                iconName = 'calendar';
                break;
              case 'Messagerie':
                iconName = 'chatbox-ellipses';
                break;
              case 'Bibliotheque':
                iconName = 'book';
                break;
              default:
                iconName = 'ellipse';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardPatient} />
        <Tab.Screen name="Agenda" component={AgendaPatient} />
        <Tab.Screen name="Messagerie" component={MessageriePatient} />
        <Tab.Screen name="Bibliotheque" component={BibliothequePatient} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default NavigationPatient;
