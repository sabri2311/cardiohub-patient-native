import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const getColor = (value) => {
  switch (value) {
    case 1: return styles.green;
    case 2: return styles.yellow;
    case 3: return styles.orange;
    case 4: return styles.red;
    default: return styles.gray;
  }
};

const DyspneeCard = ({ dyspnee, mode, onClick, historiques, patientId, onAjoutSuccess }) => {
  const [selected, setSelected] = useState(null);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert('Sélection requise', 'Veuillez choisir un niveau entre 1 et 4.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/constantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          type: 'dyspnee_nyha',
          valeur: selected,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Erreur ajout NYHA');
      setSelected(null);
      if (onAjoutSuccess) onAjoutSuccess();
    } catch (error) {
      console.error('Erreur ajout NYHA :', error);
      Alert.alert('Erreur', 'Impossible d’enregistrer la mesure.');
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

      const data = {
        labels,
        datasets: [
          {
            data: last10.map(item => item.valeur),
            color: (opacity = 1) => `rgba(234, 88, 12, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Essoufflement (NYHA)'],
      };

      return (
        <>
          <Text style={styles.title}>Essoufflement (10 dernières)</Text>
          <LineChart
            data={data}
            width={screenWidth - 40}
            height={200}
            fromZero
            yLabelsOffset={8}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#7c2d12',
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
          <Text style={styles.title}>Historique essoufflement</Text>
          {Array.isArray(historiques) && historiques.length > 0 ? (
            historiques.map((item, index) => (
              <Text key={index} style={styles.value}>
                {new Date(item.date).toLocaleDateString('fr-FR')} : Classe {item.valeur}
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
        <Text style={styles.title}>Essoufflement</Text>
        <Text style={[styles.tag, getColor(dyspnee)]}>Classe {dyspnee ?? '...'}</Text>

        <View style={styles.inputGroup}>
          <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Ajouter une nouvelle valeur :</Text>
          <View style={styles.buttonRow}>
            {[1, 2, 3, 4].map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => setSelected(val)}
                style={[
                  styles.levelButton,
                  getColor(val),
                  selected === val && styles.selectedBorder,
                ]}
              >
                <Text style={{ fontWeight: 'bold' }}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.addButton}>
            <Text style={styles.addButtonText}>Valider</Text>
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
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginBottom: 12,
  },
  green: { backgroundColor: '#bbf7d0', color: '#065f46' },
  yellow: { backgroundColor: '#fef9c3', color: '#92400e' },
  orange: { backgroundColor: '#fed7aa', color: '#7c2d12' },
  red: { backgroundColor: '#fecaca', color: '#7f1d1d' },
  gray: { backgroundColor: '#e5e7eb', color: '#374151' },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  inputGroup: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: '#000',
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

export default DyspneeCard;
