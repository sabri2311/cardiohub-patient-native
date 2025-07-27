import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import socket from '../utils/socket';

const TeleconsultationPatient = () => {
  const route = useRoute();
  const { patientId } = route.params;
  const [visioActive, setVisioActive] = useState(false);
  const [enAttente, setEnAttente] = useState(true);
  const [appelEntrant, setAppelEntrant] = useState(false);
  const [appelRoom, setAppelRoom] = useState(null);
  const [jitsiIndispo, setJitsiIndispo] = useState(false);
  const jitsiLaunchedRef = useRef(false);
  const soundRef = useRef(null);

  const canUseNativeJitsi = typeof global.nativeCallSyncHook !== 'undefined' && Platform.OS !== 'web';
  let JitsiMeet = null;
  try {
    if (canUseNativeJitsi) {
      JitsiMeet = require('react-native-jitsi-meet');
    } else {
      setJitsiIndispo(true);
    }
  } catch (e) {
    setJitsiIndispo(true);
  }

  useFocusEffect(
    React.useCallback(() => {
      setVisioActive(false);
      setEnAttente(true);
      setAppelEntrant(false);
      setAppelRoom(null);
      jitsiLaunchedRef.current = false;
    }, [])
  );

  useEffect(() => {
    const room = `teleconsultation-${patientId}`;
    socket.emit('rejoindreSalle', room);
    socket.emit('confirmerArrivee', room);

    const handlePresence = () => {
      console.log('✅ Pro connecté en salle d\'attente');
      setEnAttente(false);
      lancerVisio(room);
    };

    const handleAppel = async ({ patientId: cible, room }) => {
      if (cible === patientId) {
        console.log('📞 Appel visio hors créneau reçu du pro');
        setAppelEntrant(true);
        setAppelRoom(room);
        setEnAttente(false);
        await playRingtone();
      }
    };

    socket.on('confirmationPresence', handlePresence);
    socket.on('appelEntrant', handleAppel);

    return () => {
      socket.off('confirmationPresence', handlePresence);
      socket.off('appelEntrant', handleAppel);
      stopRingtone();
    };
  }, [patientId]);

  const playRingtone = async () => {
    try {
      if (soundRef.current) return;
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/ringtone.mp3'),
        { isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Erreur lecture sonnerie :', error);
    }
  };

  const stopRingtone = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Erreur arrêt sonnerie :', error);
    }
  };

  const lancerVisio = (room) => {
    if (jitsiLaunchedRef.current) return;
    jitsiLaunchedRef.current = true;

    const url = `https://meet.jit.si/${room}`;
    const userInfo = {
      displayName: 'Patient',
      email: '',
      avatar: '',
    };

    setVisioActive(true);
    stopRingtone();
    setAppelEntrant(false);

    if (JitsiMeet) {
      setTimeout(() => {
        JitsiMeet.call(url, userInfo);
      }, 500);
    } else {
      // WebView fallback
      setWebViewUrl(url);
    }
  };

  const [webViewUrl, setWebViewUrl] = useState(null);

  const accepterAppel = () => {
    if (appelRoom) {
      lancerVisio(appelRoom);
    } else {
      Alert.alert('Erreur', 'Aucune salle d’appel détectée.');
    }
  };

  const refuserAppel = () => {
    setAppelEntrant(false);
    stopRingtone();
    Alert.alert('Appel refusé', 'Vous avez refusé l\'appel.');
  };

  if (webViewUrl) {
    return <WebView source={{ uri: webViewUrl }} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Téléconsultation</Text>

      {jitsiIndispo ? (
        <Text style={styles.status}>❌ Visio non disponible dans Expo Go</Text>
      ) : appelEntrant ? (
        <View style={styles.appelContainer}>
          <Text style={styles.appelTexte}>📞 Appel visio entrant</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.boutonVert} onPress={accepterAppel}>
              <Text style={styles.boutonTexte}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.boutonRouge} onPress={refuserAppel}>
              <Text style={styles.boutonTexte}>Refuser</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : visioActive ? (
        <Text style={styles.status}>✅ Visio en cours…</Text>
      ) : enAttente ? (
        <>
          <Text style={styles.status}>⏳ En attente du professionnel…</Text>
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        </>
      ) : (
        <Text style={styles.status}>Connexion en cours…</Text>
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
  },
  status: {
    fontSize: 16,
    color: '#333',
  },
  appelContainer: {
    alignItems: 'center',
  },
  appelTexte: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
    width: 220,
    justifyContent: 'space-between',
  },
  boutonVert: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  boutonRouge: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  boutonTexte: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TeleconsultationPatient;
