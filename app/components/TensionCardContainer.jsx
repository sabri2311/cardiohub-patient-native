import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import TensionCard from './TensionCard';

const TensionCardContainer = ({ patientId }) => {
  const [tension, setTension] = useState({
    systolique: null,
    diastolique: null,
  });
  const [historiques, setHistoriques] = useState([]);
  const [mode, setMode] = useState('single');

  const fetchTension = async () => {
    try {
      const [sysRes, diaRes] = await Promise.all([
        fetch(`http://localhost:5000/api/constantes/${patientId}/tension_systolique`),
        fetch(`http://localhost:5000/api/constantes/${patientId}/tension_diastolique`),
      ]);

      const [sysData, diaData] = await Promise.all([
        sysRes.json(),
        diaRes.json(),
      ]);

      const fusion = sysData.map((item, index) => ({
        date: item.date,
        systolique: item.valeur,
        diastolique: diaData[index]?.valeur || null,
      }));

      setTension({
        systolique: sysData[0]?.valeur || null,
        diastolique: diaData[0]?.valeur || null,
      });

      setHistoriques(fusion);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la tension.');
      console.error('❌ Erreur récupération tension :', error);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchTension();
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
        fetchTension();
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <TensionCard
        tension={tension}
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

export default TensionCardContainer;
