import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ECGDisplay = ({ ecgValues = [] }) => {
  const [path, setPath] = useState('');
  const MAX_POINTS = 300;
  const scaleY = 0.1; // Ajuste la hauteur du tracé
  const scaleX = 2;   // Espace horizontal entre points
  const lastValuesRef = useRef([]);

  useEffect(() => {
    if (ecgValues.length === 0) return;

    // Ajoute les nouvelles valeurs aux précédentes (rolling buffer)
    lastValuesRef.current = [
      ...lastValuesRef.current,
      ...ecgValues,
    ].slice(-MAX_POINTS);

    const points = lastValuesRef.current;

    // Génère le tracé SVG
    let d = `M 0 ${150 - points[0] * scaleY}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * scaleX;
      const y = 150 - points[i] * scaleY;
      d += ` L ${x} ${y}`;
    }

    setPath(d);
  }, [ecgValues]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📈 ECG en direct</Text>
      <Svg height="200" width="100%" style={styles.graph}>
        <Path
          d={path}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  graph: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default ECGDisplay;
