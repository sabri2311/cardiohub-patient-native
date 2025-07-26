import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const FCCard = ({ fc, mode, onClick, historiques, patientId, onAjoutSuccess }) => {
  const [fcSaisie, setFcSaisie] = useState('');

  const envoyerMesure = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/constantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          type: 'frequence_cardiaque',
          valeur: parseFloat(fcSaisie),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Erreur ajout FC');
      setFcSaisie('');
      if (onAjoutSuccess) onAjoutSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d’enregistrer la mesure FC');
    }
  };

  const renderContent = () => {
    const last10 = Array.isArray(historiques) ? historiques.slice(0, 10).reverse() : [];

    if (mode === 'curve') {
      const labels = last10.map(item =>
        new Date(item.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        })
      );

      const valeurs = last10.map(item => item.valeur);

      const data = {
        labels,
        datasets: [
          {
            data: valeurs,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Fréquence cardiaque'],
      };

      return (
        <>
          <Text style={styles.title}>Fréquence cardiaque (10 dernières)</Text>
          <LineChart
            data={data}
            width={screenWidth - 40}
            height={200}
            yAxisSuffix=" bpm"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#2563eb',
              },
            }}
            bezier
            style={styles.chart}
          />
        </>
      );
    }

    if (mode === 'table') {
      return (
        <View style={styles.tableWrapper}>
          <Text style={styles.title}>Historique fréquence cardiaque</Text>
          {Array.isArray(historiques) && historiques.length > 0 ? (
            historiques.map((item, index) => (
              <Text key={index} style={styles.value}>
                {new Date(item.date).toLocaleDateString('fr-FR')} : {item.valeur} bpm
              </Text>
            ))
          ) : (
            <Text style={styles.value}>Aucune donnée.</Text>
          )}
        </View>
      );
    }

    // mode === 'single'
    return (
      <>
        <Text style={styles.title}>Fréquence cardiaque</Text>
        <Text style={styles.value}>
          Dernière mesure : {fc !== null ? `${fc} bpm` : 'Chargement...'}
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter manuellement (bpm)"
            keyboardType="numeric"
            value={fcSaisie}
            onChangeText={setFcSaisie}
          />
          <TouchableOpacity onPress={envoyerMesure} style={styles.addButton}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <TouchableOpacity onPress={onClick} style={styles.card} activeOpacity={0.9}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  inputGroup: {
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#0072c6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tableWrapper: {
    gap: 6,
  },
});

export default FCCard;
