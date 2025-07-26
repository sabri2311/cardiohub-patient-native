import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Connexion = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleConnexion = async () => {
    if (!email || !motDePasse) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setChargement(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          motDePasse,
          role: 'patient',
        }),
      });

      if (!response.ok) {
        const erreur = await response.json();
        throw new Error(erreur.message || 'Erreur de connexion');
      }

      const data = await response.json();
      const { id: patientId, nom, prenom, premiere_connexion } = data.utilisateur;

      await AsyncStorage.setItem('token', 'real-token'); // à remplacer plus tard par vrai JWT
      await AsyncStorage.setItem('patientId', patientId);
      await AsyncStorage.setItem('patientNom', `${prenom} ${nom}`);

      if (premiere_connexion) {
        navigation.navigate('ChangementMotDePasse');
      } else {
        navigation.navigate('DashboardPatient');
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion Patient</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
      />
      <Button
        title={chargement ? 'Connexion...' : 'Se connecter'}
        onPress={handleConnexion}
        disabled={chargement}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f7fa',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});

export default Connexion;
