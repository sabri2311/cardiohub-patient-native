import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import PoidsCard from './PoidsCard';

const PoidsCardContainer = ({ patientId }) => {
  const [donnees, setDonnees] = useState({
    poids: null,
    masseHydrique: null,
    masseGrasse: null,
  });
  const [historiques, setHistoriques] = useState({
    poids: [],
    masseHydrique: [],
    masseGrasse: [],
  });
  const [mode, setMode] = useState('single');

  const fetchDonnees = async () => {
    try {
      const [poidsRes, hydriqueRes, graisseRes] = await Promise.all([
        fetch(`http://localhost:5000/api/constantes/${patientId}/poids`),
        fetch(`http://localhost:5000/api/constantes/${patientId}/masse_hydrique`),
        fetch(`http://localhost:5000/api/constantes/${patientId}/masse_grasse`),
      ]);

      const [poidsData, hydriqueData, graisseData] = await Promise.all([
        poidsRes.json(),
        hydriqueRes.json(),
        graisseRes.json(),
      ]);

      setDonnees({
        poids: poidsData[0]?.valeur || null,
        masseHydrique: hydriqueData[0]?.valeur || null,
        masseGrasse: graisseData[0]?.valeur || null,
      });

      setHistoriques({
        poids: poidsData || [],
        masseHydrique: hydriqueData || [],
        masseGrasse: graisseData || [],
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les constantes de poids');
      console.error('❌ Erreur chargement Poids :', error);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchDonnees();
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
        fetchDonnees();
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <PoidsCard
        donnees={donnees}
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

export default PoidsCardContainer;
