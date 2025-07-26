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

const PoidsCard = ({ donnees, mode, onClick, historiques, patientId, onAjoutSuccess }) => {
  const [poidsSaisi, setPoidsSaisi] = useState('');
  const [hydriqueSaisie, setHydriqueSaisie] = useState('');
  const [grasseSaisie, setGrasseSaisie] = useState('');

  const envoyerMesure = async (type, valeur) => {
    try {
      const response = await fetch('http://localhost:5000/api/constantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          type,
          valeur: parseFloat(valeur),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`Erreur ajout ${type}`);
      console.log(`✅ Mesure "${type}" enregistrée : ${valeur}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', `Impossible d’enregistrer la mesure ${type}`);
    }
  };

  const handleAjouter = async () => {
    if (!poidsSaisi && !hydriqueSaisie && !grasseSaisie) {
      Alert.alert('Champ vide', 'Veuillez saisir au moins une valeur.');
      return;
    }

    if (poidsSaisi) await envoyerMesure('poids', poidsSaisi);
    if (hydriqueSaisie) await envoyerMesure('masse_hydrique', hydriqueSaisie);
    if (grasseSaisie) await envoyerMesure('masse_grasse', grasseSaisie);

    setPoidsSaisi('');
    setHydriqueSaisie('');
    setGrasseSaisie('');

    if (onAjoutSuccess) onAjoutSuccess();
  };

  const renderContent = () => {
    const poidsHist = historiques.poids || [];
    const hydriqueHist = historiques.masseHydrique || [];
    const grasseHist = historiques.masseGrasse || [];

    if (mode === 'curve') {
      const labels = poidsHist.slice(0, 10).reverse().map(item =>
        new Date(item.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        })
      );

      const data = {
        labels,
        datasets: [
          {
            data: poidsHist.slice(0, 10).reverse().map(item => item.valeur),
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: hydriqueHist.slice(0, 10).reverse().map(item => item.valeur),
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: grasseHist.slice(0, 10).reverse().map(item => item.valeur),
            color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Poids', 'Hydrique', 'Grasse'],
      };

      return (
        <>
          <Text style={styles.title}>Poids / Masse (10 dernières)</Text>
          <LineChart
            data={data}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#555',
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
          <Text style={styles.title}>Tableau des mesures</Text>
          {poidsHist.length > 0 ? (
            poidsHist.map((item, index) => (
              <Text key={index} style={styles.value}>
                {new Date(item.date).toLocaleDateString('fr-FR')} :
                {` ${item.valeur} kg`} /
                {` ${hydriqueHist[index]?.valeur ?? '-'} % hydrique`} /
                {` ${grasseHist[index]?.valeur ?? '-'} % grasse`}
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
        <Text style={styles.title}>Poids / Masse</Text>
        <Text style={styles.value}>
          Dernier poids : {donnees?.poids ?? '...'} kg
        </Text>
        <Text style={styles.value}>
          Hydrique : {donnees?.masseHydrique ?? '...'} %
        </Text>
        <Text style={styles.value}>
          Grasse : {donnees?.masseGrasse ?? '...'} %
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Poids (kg)"
            keyboardType="numeric"
            value={poidsSaisi}
            onChangeText={setPoidsSaisi}
          />
          <TextInput
            style={styles.input}
            placeholder="Hydrique (%)"
            keyboardType="numeric"
            value={hydriqueSaisie}
            onChangeText={setHydriqueSaisie}
          />
          <TextInput
            style={styles.input}
            placeholder="Grasse (%)"
            keyboardType="numeric"
            value={grasseSaisie}
            onChangeText={setGrasseSaisie}
          />
          <TouchableOpacity onPress={handleAjouter} style={styles.addButton}>
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

export default PoidsCard;
