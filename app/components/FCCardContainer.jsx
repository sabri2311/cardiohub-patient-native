import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import FCCard from './FCCard';

const FCCardContainer = ({ patientId }) => {
  const [fc, setFc] = useState(null);
  const [historiques, setHistoriques] = useState([]);
  const [mode, setMode] = useState('single');

  const fetchFC = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/constantes/${patientId}/frequence_cardiaque`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setFc(data[0].valeur);
        setHistoriques(data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de fréquence cardiaque');
      console.error('❌ Erreur récupération FC :', error);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchFC();
    }
  }, [patientId]);

  const handleClick = () => {
    if (mode === 'single') setMode('curve');
    else if (mode === 'curve') setMode('table');
    else setMode('single');
  };

  const rechargerDonnees = () => {
    if (patientId) {
      setTimeout(() => {
        fetchFC();
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <FCCard
        fc={fc}
        historiques={historiques}
        mode={mode}
        onClick={handleClick}
        patientId={patientId}
        onAjoutSuccess={rechargerDonnees}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default FCCardContainer;
