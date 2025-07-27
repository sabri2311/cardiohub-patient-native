import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import socket from '../utils/socket';

const SessionAtelierPatient = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupeId, patientId } = route.params;

  const [atelierEnCours, setAtelierEnCours] = useState(false);
  const [room, setRoom] = useState(null);
  const [chrono, setChrono] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const eventName = `atelierDisponible-${groupeId}`;

    socket.on(eventName, ({ room }) => {
      console.log('✅ Atelier détecté côté patient, room :', room);
      setAtelierEnCours(true);
      setRoom(room);
    });

    socket.emit('rejoindreAtelier', { groupeId, patientId });

    return () => {
      socket.off(eventName);
      clearInterval(intervalRef.current);
    };
  }, [groupeId, patientId]);

  useEffect(() => {
    if (atelierEnCours && room) {
      startChrono();
    }
  }, [atelierEnCours, room]);

  const startChrono = () => {
    intervalRef.current = setInterval(() => {
      setChrono((prev) => prev + 1);
    }, 1000);
  };

  const quitterAtelier = () => {
    clearInterval(intervalRef.current);
    Alert.alert('Atelier terminé', 'Merci pour votre participation !');
    navigation.navigate('AgendaPatient');
  };

  const formatChrono = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const getMeetUrl = () => {
    return `https://meet.jit.si/${room}#userInfo.displayName="Patient-${patientId}"`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Atelier collectif – Éducation thérapeutique</Text>

      {atelierEnCours && room ? (
        <>
          <View style={styles.visioContainer}>
            <WebView
              source={{ uri: getMeetUrl() }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          </View>

          <Text style={styles.chrono}>⏱️ Temps écoulé : {formatChrono(chrono)}</Text>

          <TouchableOpacity style={styles.buttonQuitter} onPress={quitterAtelier}>
            <Text style={styles.buttonText}>🚪 Quitter l’atelier</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.status}>⏳ En attente du lancement de l’atelier…</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fa',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  visioContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 20,
  },
  chrono: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonQuitter: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: '#333',
    marginTop: 30,
    textAlign: 'center',
  },
});

export default SessionAtelierPatient;
