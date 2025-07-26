import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FCCardContainer from '../components/FCCardContainer';
import PoidsCardContainer from '../components/PoidsCardContainer';
import TensionCardContainer from '../components/TensionCardContainer';
import DyspneeCardContainer from '../components/DyspneeCardContainer';

const DashboardPatient = () => {
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const fetchId = async () => {
      try {
        const id = await AsyncStorage.getItem('patientId');
        setPatientId(id);
      } catch (error) {
        console.error('❌ Erreur récupération patientId :', error);
      }
    };
    fetchId();
  }, []);

  const handleConnexionWithings = () => {
    Linking.openURL('https://cardiohub.fr/api/withings/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Suivi de mes constantes</Text>

      <TouchableOpacity style={styles.button} onPress={handleConnexionWithings}>
        <Text style={styles.buttonText}>Connecter mon compte Withings</Text>
      </TouchableOpacity>

      <View style={styles.cards}>
        {patientId && (
          <>
            <FCCardContainer patientId={patientId} />
            <PoidsCardContainer patientId={patientId} />
            <TensionCardContainer patientId={patientId} />
            <DyspneeCardContainer patientId={patientId} />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4f7fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0072c6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cards: {
    gap: 16,
  },
});

export default DashboardPatient;
