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

const TensionCard = ({ tension, mode, onClick, historiques, patientId, onAjoutSuccess }) => {
  const [sysSaisi, setSysSaisi] = useState('');
  const [diaSaisi, setDiaSaisi] = useState('');

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
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', `Impossible d’enregistrer la mesure ${type}`);
    }
  };

  const handleAjouter = async () => {
    if (!sysSaisi && !diaSaisi) {
      Alert.alert('Champ vide', 'Veuillez saisir au moins une valeur.');
      return;
    }

    if (sysSaisi) await envoyerMesure('tension_systolique', sysSaisi);
    if (diaSaisi) await envoyerMesure('tension_diastolique', diaSaisi);

    setSysSaisi('');
    setDiaSaisi('');

    if (onAjoutSuccess) onAjoutSuccess();
  };

  const renderContent = () => {
    if (mode === 'curve') {
      const last10 = Array.isArray(historiques) ? historiques.slice(0, 10).reverse() : [];

      const labels = last10.map(item =>
        new Date(item.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        })
      );

      const data = {
        labels,
        datasets: [
          {
            data: last10.map(item => item.systolique),
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: last10.map(item => item.diastolique),
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Systolique', 'Diastolique'],
      };

      return (
        <>
          <Text style={styles.title}>Tension artérielle (10 dernières)</Text>
          <LineChart
            data={data}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=" mmHg"
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
          {Array.isArray(historiques) && historiques.length > 0 ? (
            historiques.map((item, idx) => (
              <Text key={idx} style={styles.value}>
                {new Date(item.date).toLocaleDateString('fr-FR')} : {item.systolique}/{item.diastolique} mmHg
              </Text>
            ))
          ) : (
            <Text style={styles.value}>Aucune donnée.</Text>
          )}
        </View>
      );
    }

    return (
      <>
        <Text style={styles.title}>Tension artérielle</Text>
        <Text style={styles.value}>
          Dernière mesure :{' '}
          {tension?.systolique && tension?.diastolique
            ? `${tension.systolique}/${tension.diastolique} mmHg`
            : '...'}
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Systolique"
            keyboardType="numeric"
            value={sysSaisi}
            onChangeText={setSysSaisi}
          />
          <TextInput
            style={styles.input}
            placeholder="Diastolique"
            keyboardType="numeric"
            value={diaSaisi}
            onChangeText={setDiaSaisi}
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

export default TensionCard;
