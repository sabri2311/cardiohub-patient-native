import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import DyspneeCard from './DyspneeCard';

const DyspneeCardContainer = ({ patientId }) => {
  const [dyspnee, setDyspnee] = useState(null);
  const [historiques, setHistoriques] = useState([]);
  const [mode, setMode] = useState('single');

  const fetchDyspnee = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/constantes/${patientId}/dyspnee_nyha`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setDyspnee(data[0].valeur);
        setHistoriques(data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l’essoufflement');
      console.error('❌ Erreur récupération dyspnée :', error);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchDyspnee();
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
        fetchDyspnee();
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <DyspneeCard
        dyspnee={dyspnee}
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

export default DyspneeCardContainer;
