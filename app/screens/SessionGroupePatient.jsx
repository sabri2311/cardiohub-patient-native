import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import ECGDisplay from '../components/ECGDisplay';
import movesense from '../services/movesenseService';
import socket from '../utils/socket';

const SessionGroupePatient = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupeId, patientId } = route.params;

  const [room, setRoom] = useState(null);
  const [chrono, setChrono] = useState(0);
  const [ecgData, setEcgData] = useState([]);
  const [frequenceCardiaque, setFrequenceCardiaque] = useState(null);
  const [visioActive, setVisioActive] = useState(false);
  const chronoRef = useRef(null);

  useEffect(() => {
    const eventName = `atelierDisponible-${groupeId}`;
    socket.on(eventName, ({ room }) => {
      console.log('✅ Atelier collectif détecté, room =', room);
      setRoom(room);
    });

    socket.emit('rejoindreAtelier', { groupeId, patientId });

    return () => {
      socket.off(eventName);
      clearInterval(chronoRef.current);
      if (movesense.stopECG) movesense.stopECG();
      if (movesense.disconnectDevice) movesense.disconnectDevice();
    };
  }, [groupeId, patientId]);

  useEffect(() => {
    if (room) {
      lancerChrono();
      connecterCapteur();
      setVisioActive(true);
    }
  }, [room]);

  const lancerChrono = () => {
    chronoRef.current = setInterval(() => {
      setChrono((prev) => prev + 1);
    }, 1000);
  };

  const connecterCapteur = async () => {
    if (!movesense.startScan) return;

    try {
      await movesense.startScan(async (device) => {
        const connected = await movesense.connectToDevice(device);
        await movesense.subscribeToECG((values) => {
          setEcgData(values);
          calculerFC(values);
          socket.emit('fluxECG', {
            groupeId,
            patientId,
            ecg: values,
            frequenceCardiaque,
            timestamp: Date.now(),
          });
        });
      });
    } catch (error) {
      console.warn('❌ Erreur Movesense :', error);
    }
  };

  const calculerFC = (values) => {
    if (!values || values.length === 0) return;
    const moyenne = Math.round(
      values.slice(-10).reduce((sum, v) => sum + Math.abs(v), 0) / Math.min(10, values.length)
    );
    setFrequenceCardiaque(moyenne);
  };

  const quitterSeance = () => {
    clearInterval(chronoRef.current);
    if (movesense.stopECG) movesense.stopECG();
    if (movesense.disconnectDevice) movesense.disconnectDevice();
    Alert.alert('Séance terminée', 'Merci pour votre participation !');
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
      <Text style={styles.title}>🚴‍♂️ Réentraînement collectif – Patient</Text>

      {room && visioActive ? (
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

          <View style={styles.box}>
            <Text style={styles.label}>⏱️ Chronomètre</Text>
            <Text style={styles.value}>{formatChrono(chrono)}</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>❤️ Fréquence cardiaque</Text>
            <Text style={styles.value}>{frequenceCardiaque ?? '...'}</Text>
          </View>

          <ECGDisplay ecgValues={ecgData} />

          <TouchableOpacity style={styles.buttonQuitter} onPress={quitterSeance}>
            <Text style={styles.buttonText}>🛑 Quitter la séance</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.status}>⏳ En attente du lancement de la séance…</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fa',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
    color: '#333',
  },
  visioContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  buttonQuitter: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SessionGroupePatient;
