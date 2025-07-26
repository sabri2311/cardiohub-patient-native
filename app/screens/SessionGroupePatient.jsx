import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import socket from '../utils/socket';
import ECGDisplay from '../components/ECGDisplay';

const isExpoGo = typeof global.__expo !== 'undefined';

let JitsiMeet = null;
let movesense = {};

if (Platform.OS !== 'web' && !isExpoGo) {
  JitsiMeet = require('react-native-jitsi-meet');
  movesense = require('../services/movesenseService');
}

const SessionGroupePatient = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupeId, patientId } = route.params;

  const [room, setRoom] = useState(null);
  const [chrono, setChrono] = useState(0);
  const [ecgData, setEcgData] = useState([]);
  const [frequenceCardiaque, setFrequenceCardiaque] = useState(null);
  const [jitsiLance, setJitsiLance] = useState(false);
  const jitsiStartedRef = useRef(false);
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
    if (room && !jitsiLance && !jitsiStartedRef.current) {
      jitsiStartedRef.current = true;

      lancerVisio();
      lancerChrono();
      connecterCapteur();
    }
  }, [room]);

  const lancerVisio = () => {
    if (!JitsiMeet) return;

    const userInfo = { displayName: `Patient ${patientId}`, email: '', avatar: '' };
    setTimeout(() => {
      JitsiMeet.call(room, userInfo);
      setJitsiLance(true);
    }, 500);
  };

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
    if (JitsiMeet) JitsiMeet.endCall();
    Alert.alert('Séance terminée', 'Merci pour votre participation !');
    navigation.navigate('AgendaPatient');
  };

  const formatChrono = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚴‍♂️ Réentraînement collectif – Patient</Text>

      {!JitsiMeet || !movesense.startScan ? (
        <Text style={styles.status}>
          ❌ Visio ou capteur non disponible dans Expo Go
        </Text>
      ) : room ? (
        <>
          <Text style={styles.status}>✅ Visio en cours – Groupe {groupeId}</Text>

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
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
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
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  buttonQuitter: {
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

export default SessionGroupePatient;
