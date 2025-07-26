import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Onglets principaux patient
import DashboardPatient from './app/screens/DashboardPatient';
import AgendaPatient from './app/screens/AgendaPatient';
import MessageriePatient from './app/screens/MessageriePatient';
import BibliothequePatient from './app/screens/BibliothequePatient';

// Écrans hors onglets
import TeleconsultationPatient from './app/screens/TeleconsultationPatient';
import SessionVeloPatient from './app/screens/SessionVeloPatient';
import SessionGroupePatient from './app/screens/SessionGroupePatient';
import SessionAtelierPatient from './app/screens/SessionAtelierPatient';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabsPatient() {
  return (
    <Tab.Navigator
      initialRouteName="DashboardPatient"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'DashboardPatient') iconName = 'home';
          else if (route.name === 'AgendaPatient') iconName = 'calendar';
          else if (route.name === 'MessageriePatient') iconName = 'chatbubble-ellipses';
          else if (route.name === 'BibliothequePatient') iconName = 'book';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen
        name="DashboardPatient"
        component={DashboardPatient}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="AgendaPatient"
        component={AgendaPatient}
        options={{ title: 'Agenda' }}
      />
      <Tab.Screen
        name="MessageriePatient"
        component={MessageriePatient}
        options={{ title: 'Messagerie' }}
      />
      <Tab.Screen
        name="BibliothequePatient"
        component={BibliothequePatient}
        options={{ title: 'Bibliothèque' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Onglets principaux */}
        <Stack.Screen name="TabsPatient" component={TabsPatient} />

        {/* Écrans spécifiques hors onglets */}
        <Stack.Screen name="TeleconsultationPatient" component={TeleconsultationPatient} />
        <Stack.Screen name="SessionVeloPatient" component={SessionVeloPatient} />
        <Stack.Screen name="SessionGroupePatient" component={SessionGroupePatient} />
        <Stack.Screen name="SessionAtelierPatient" component={SessionAtelierPatient} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
