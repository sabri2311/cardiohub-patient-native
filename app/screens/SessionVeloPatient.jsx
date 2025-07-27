import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ECGDisplay from '../components/ECGDisplay';

const isExpoGo = typeof global.__expo !== 'undefined';

let JitsiMeet = null;
let movesense = {};

if (Platform.OS !== 'web' && !isExpoGo) {
  try {
    JitsiMeet = require('react-native-jitsi-meet');
    movesense = require('../services/movesenseService');
  } catch (error) {
    console.warn('❌ Erreur chargement Jitsi ou Movesense :', error);
  }
}

const SessionVeloPatient = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params;

  const [chrono, setChrono] = useState(0);
  const [frequenceCardiaque, setFrequenceCardiaque] = useState(null);
  const [ecgData, setEcgData] = useState([]);
  const [jitsiLance, setJitsiLance] = useState(false);

  const jitsiRef = useRef(false);
  const chronoRef = useRef(null);

  useEffect(() => {
    if (!JitsiMeet || !movesense.startScan) return;

    lancerVisio();
    lancerChrono();
    connecterCapteur();

    return () => {
      clearInterval(chronoRef.current);
      if (movesense.stopECG) movesense.stopECG();
      if (movesense.disconnectDevice) movesense.disconnectDevice();
      if (JitsiMeet) JitsiMeet.endCall();
    };
  }, []);

  const lancerVisio = () => {
    if (jitsiRef.current) return;
    jitsiRef.current = true;

    const room = `CardioHub-Velo-Session-${patientId}`;
    const userInfo = {
      displayName: `Patient ${patientId}`,
      email: '',
      avatar: '',
    };

    setTimeout(() => {
      try {
        JitsiMeet.call(room, userInfo);
        setJitsiLance(true);
      } catch (err) {
        console.warn('❌ Erreur Jitsi :', err);
      }
    }, 500);
  };

  const lancerChrono = () => {
    chronoRef.current = setInterval(() => {
      setChrono((prev) => prev + 1);
    }, 1000);
  };

  const connecterCapteur = async () => {
    try {
      await movesense.startScan(async (device) => {
        await movesense.connectToDevice(device);
        await movesense.subscribeToECG((values) => {
          setEcgData(values);
          calculerFC(values);
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

  const formatChrono = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleFin = () => {
    clearInterval(chronoRef.current);
    if (movesense.stopECG) movesense.stopECG();
    if (movesense.disconnectDevice) movesense.disconnectDevice();
    if (JitsiMeet) JitsiMeet.endCall();
    Alert.alert('Séance terminée', 'Merci pour votre effort !');
    navigation.navigate('AgendaPatient');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚴‍♂️ Séance individuelle – Vélo</Text>

      {!JitsiMeet || !movesense.startScan ? (
        <Text style={styles.label}>❌ Visio ou capteur indisponible dans Expo Go</Text>
      ) : (
        <>
          <View style={styles.box}>
            <Text style={styles.label}>⏱️ Chronomètre</Text>
            <Text style={styles.value}>{formatChrono(chrono)}</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>❤️ Fréquence cardiaque</Text>
            <Text style={styles.value}>{frequenceCardiaque ?? '...'}</Text>
          </View>

          <ECGDisplay ecgValues={ecgData} />

          <TouchableOpacity onPress={handleFin} style={styles.button}>
            <Text style={styles.buttonText}>🛑 Fin de séance</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fa',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    width: '90%',
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  label: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  button: {
    marginTop: 20,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SessionVeloPatient;
