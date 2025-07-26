import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageriePatient = () => {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState('');
  const [professionnels, setProfessionnels] = useState([]);
  const [destinataire, setDestinataire] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingPros, setLoadingPros] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const fetchId = async () => {
      const id = await AsyncStorage.getItem('patientId');
      setPatientId(id);
    };
    fetchId();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    const fetchProfessionnels = async () => {
      try {
        setLoadingPros(true);
        const res = await fetch(`http://localhost:5000/api/patients_professionnels/patient/${patientId}`);
        const data = await res.json();
        setProfessionnels(data);
      } catch (err) {
        console.error('Erreur pros :', err);
        setError('Erreur chargement professionnels');
      } finally {
        setLoadingPros(false);
      }
    };
    fetchProfessionnels();
  }, [patientId]);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`http://localhost:5000/api/messages/patient/${patientId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Erreur messages :', err);
      setError('Erreur chargement messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchMessages();
  }, [patientId]);

  const envoyerMessage = async () => {
    if (!contenu.trim()) return Alert.alert('Erreur', 'Le message ne peut pas être vide');
    if (!destinataire) return Alert.alert('Erreur', 'Veuillez choisir un destinataire');

    const payload = {
      contenu: contenu.trim(),
      expediteur_id: patientId,
      expediteur_type: 'patient',
      destinataire_id: destinataire,
      destinataire_type: 'professionnel',
    };

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erreur envoi message');

      await fetchMessages();
      setContenu('');
      setDestinataire('');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const messagesParExpediteur = {};
  messages.forEach((msg) => {
    const key = msg.expediteur_id === patientId ? 'vous' : msg.expediteur_id;
    if (!messagesParExpediteur[key]) messagesParExpediteur[key] = [];
    messagesParExpediteur[key].push(msg);
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💬 Messagerie</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.block}>
        <Text style={styles.label}>Destinataire :</Text>
        <View style={styles.selectBox}>
          {professionnels.map((pro) => (
            <TouchableOpacity
              key={pro.id}
              onPress={() => setDestinataire(pro.id)}
              style={[
                styles.option,
                destinataire === pro.id && styles.optionSelected,
              ]}
            >
              <Text>
                {pro.prenom} {pro.nom} ({pro.role})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Votre message :</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Écrivez votre message..."
          value={contenu}
          onChangeText={setContenu}
        />
        <TouchableOpacity style={styles.button} onPress={envoyerMessage}>
          <Text style={styles.buttonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <Text style={styles.subtitle}>📨 Historique des messages</Text>
        {loadingMessages ? (
          <Text>Chargement des messages...</Text>
        ) : messages.length === 0 ? (
          <Text>Aucun message.</Text>
        ) : (
          Object.entries(messagesParExpediteur).map(([id, msgs], index) => (
            <View key={index} style={styles.thread}>
              <Text style={styles.sender}>
                {id === 'vous'
                  ? 'Messages envoyés par vous'
                  : `De ${msgs[0].prenom_expediteur} ${msgs[0].nom_expediteur} (${msgs[0].role_expediteur})`}
              </Text>
              {msgs.map((msg) => (
                <View key={msg.id} style={styles.message}>
                  <Text style={styles.date}>
                    {new Date(msg.date_envoi).toLocaleString()}
                  </Text>
                  <Text>{msg.contenu}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4f7fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
  },
  block: {
    marginBottom: 24,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  selectBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionSelected: {
    backgroundColor: '#e0f2fe',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  thread: {
    marginBottom: 16,
  },
  sender: {
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  message: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    elevation: 1,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default MessageriePatient;
