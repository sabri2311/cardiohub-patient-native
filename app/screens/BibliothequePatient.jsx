import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import axios from 'axios';

const BibliothequePatient = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bibliotheque');
        setDocuments(res.data);
      } catch (error) {
        console.error('Erreur chargement bibliothèque :', error);
        Alert.alert('Erreur', 'Impossible de charger les documents.');
      }
    };

    fetchDocuments();
  }, []);

  const ouvrirLien = async (lien) => {
    const supported = await Linking.canOpenURL(lien);
    if (supported) {
      await Linking.openURL(lien);
    } else {
      Alert.alert("Erreur", "Lien invalide ou non supporté.");
    }
  };

  const themes = [...new Set(documents.map((doc) => doc.theme))];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📚 Bibliothèque éducative</Text>
      {themes.map((theme, i) => (
        <View key={i} style={styles.themeSection}>
          <Text style={styles.themeTitle}>{theme}</Text>
          {documents
            .filter((doc) => doc.theme === theme)
            .map((doc, j) => (
              <TouchableOpacity key={j} onPress={() => ouvrirLien(doc.lien)}>
                <Text style={styles.linkText}>• {doc.titre}</Text>
              </TouchableOpacity>
            ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4f7fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeSection: {
    marginBottom: 24,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  linkText: {
    fontSize: 15,
    color: '#2563eb',
    paddingVertical: 6,
    textDecorationLine: 'underline',
  },
});

export default BibliothequePatient;
