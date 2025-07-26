import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import socket from '../utils/socket';

let JitsiMeet = null;
const isExpoGo = typeof global.__expo !== 'undefined';

if (Platform.OS !== 'web' && !isExpoGo) {
  JitsiMeet = require('react-native-jitsi-meet');
}

const SessionAtelierPatient = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupeId, patientId } = route.params;

  const [atelierEnCours, setAtelierEnCours] = useState(false);
  const [chrono, setChrono] = useState(0);
  const [room, setRoom] = useState(null);
  const [jitsiLance, setJitsiLance] = useState(false);
  const intervalRef = useRef(null);
  const jitsiStartedRef = useRef(false);

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
    if (atelierEnCours && room && !jitsiLance && !jitsiStartedRef.current && JitsiMeet) {
      jitsiStartedRef.current = true;

      const userInfo = {
        displayName: `Patient ${patientId}`,
        email: '',
        avatar: '',
      };

      setTimeout(() => {
        JitsiMeet.call(room, userInfo);
        setJitsiLance(true);
        startChrono();
      }, 500);
    }
  }, [atelierEnCours, room]);

  const startChrono = () => {
    intervalRef.current = setInterval(() => {
      setChrono((prev) => prev + 1);
    }, 1000);
  };

  const quitterAtelier = () => {
    clearInterval(intervalRef.current);
    if (JitsiMeet) {
      JitsiMeet.endCall();
    }
    Alert.alert('Atelier terminé', 'Merci pour votre participation !');
    navigation.navigate('AgendaPatient');
  };

  const formatChrono = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Atelier collectif – Éducation thérapeutique</Text>

      {!JitsiMeet ? (
        <Text style={styles.status}>❌ Visio non disponible dans Expo Go</Text>
      ) : atelierEnCours ? (
        <>
          <Text style={styles.status}>✅ Visio en cours…</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  chrono: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonQuitter: {
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

export default SessionAtelierPatient;
