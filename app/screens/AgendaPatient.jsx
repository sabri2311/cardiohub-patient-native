import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AgendaPatient = () => {
  const [patientId, setPatientId] = useState(null);
  const [patientNom, setPatientNom] = useState('');
  const [rendezVous, setRendezVous] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchInfos = async () => {
      const id = await AsyncStorage.getItem('patientId');
      const nom = await AsyncStorage.getItem('patientNom');
      setPatientId(id);
      setPatientNom(nom || 'Patient');
    };
    fetchInfos();
  }, []);

  useEffect(() => {
    const fetchRendezVous = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/rendezvous/patient/${patientId}`);
        const data = await response.json();
        setRendezVous(data);
      } catch (error) {
        console.error('Erreur chargement rendez-vous :', error);
        Alert.alert('Erreur', 'Impossible de charger les rendez-vous');
      }
    };

    if (patientId) fetchRendezVous();
  }, [patientId]);

  const maintenant = new Date();

  const afficherAVenir = rendezVous.filter(rdv => new Date(rdv.date) >= maintenant);
  const afficherHistorique = rendezVous.filter(rdv => new Date(rdv.date) < maintenant);

  const getType = (type) => {
    const libelles = {
      teleconsultation: 'Téléconsultation',
      reentrainement_individuel: 'Réentraînement individuel',
      reentrainement_collectif: 'Réentraînement collectif',
      atelier: 'Atelier collectif',
    };
    return libelles[type] || 'Rendez-vous';
  };

  const rejoindreSeance = (rdv) => {
    const screen = {
      teleconsultation: 'TeleconsultationPatient',
      reentrainement_individuel: 'SessionVeloPatient',
      reentrainement_collectif: 'SessionGroupePatient',
      atelier: 'SessionAtelierPatient',
    }[rdv.type];

    if (!screen) {
      Alert.alert('Erreur', 'Type de rendez-vous non reconnu');
      return;
    }

    if (rdv.type === 'atelier') {
      navigation.navigate(screen, {
        groupeId: rdv.groupeId,
        patientId,
      });
    } else if (rdv.type === 'reentrainement_collectif') {
      navigation.navigate(screen, {
        groupeId: rdv.groupeId,
        patientId,
      });
    } else {
      navigation.navigate(screen, {
        patientId,
      });
    }
  };

  const peutRejoindre = (rdv) => {
    const dateRdv = new Date(rdv.date);
    return dateRdv <= maintenant && maintenant - dateRdv < 60 * 60 * 1000;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Rendez-vous à venir</Text>
      {afficherAVenir.length === 0 ? (
        <Text style={styles.empty}>Aucun rendez-vous pour l’instant.</Text>
      ) : (
        afficherAVenir.map((rdv, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.label}>
              {new Date(rdv.date).toLocaleString()} — <Text style={styles.bold}>{getType(rdv.type)}</Text>
            </Text>
            <Text style={styles.subtext}>
              Avec {rdv.pro_prenom} {rdv.pro_nom} ({rdv.pro_role})
            </Text>
            {peutRejoindre(rdv) && (
              <Button title="Rejoindre la séance" onPress={() => rejoindreSeance(rdv)} />
            )}
          </View>
        ))
      )}

      <Text style={[styles.title, { marginTop: 24 }]}>🕘 Historique des séances passées</Text>
      {afficherHistorique.length === 0 ? (
        <Text style={styles.empty}>Aucune séance précédente.</Text>
      ) : (
        afficherHistorique.map((rdv, index) => (
          <View key={index} style={styles.card}>
            <Text>
              {new Date(rdv.date).toLocaleString()} — <Text style={styles.bold}>{getType(rdv.type)}</Text>
            </Text>
            <Text style={styles.subtext}>
              {rdv.pro_prenom} {rdv.pro_nom} ({rdv.pro_role})
            </Text>
          </View>
        ))
      )}
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
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  empty: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
});

export default AgendaPatient;
