import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

const ECG_UUID_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const ECG_UUID_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

let bleManager = null;
let BleManager = null;
let connectedDevice = null;
let ecgSubscription = null;

if (Platform.OS !== 'web') {
  try {
    BleManager = require('react-native-ble-plx').BleManager;
    bleManager = new BleManager();
  } catch (error) {
    console.warn('📵 BLE non disponible (Expo Go ou Web)');
  }
}

const requestPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
    } catch (error) {
      console.warn('❌ Permissions refusées ou indisponibles');
      return false;
    }
  }
  return true;
};

export const startScan = async (onDeviceFound) => {
  if (!bleManager) return console.warn('📵 BLE non dispo');

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  try {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) return console.error('Erreur de scan :', error);

      if (device?.name?.includes('Movesense')) {
        console.log('📡 Capteur détecté :', device.name);
        bleManager.stopDeviceScan();
        onDeviceFound(device);
      }
    });
  } catch (e) {
    console.warn('❌ Scan non supporté');
  }
};

export const connectToDevice = async (device) => {
  if (!bleManager) return console.warn('📵 BLE non dispo');

  try {
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();
    connectedDevice = connected;
    console.log('✅ Connecté à Movesense :', connected.name);
    return connected;
  } catch (error) {
    console.error('❌ Connexion échouée :', error);
    throw error;
  }
};

export const subscribeToECG = async (onECGData) => {
  if (!connectedDevice) return console.warn('Pas de device connecté');

  try {
    ecgSubscription = connectedDevice.monitorCharacteristicForService(
      ECG_UUID_SERVICE,
      ECG_UUID_CHARACTERISTIC,
      (error, characteristic) => {
        if (error) return console.error('❌ Erreur ECG :', error);

        const rawData = characteristic.value;
        const buffer = Buffer.from(rawData, 'base64');
        const ecgValues = [];

        for (let i = 0; i < buffer.length; i += 2) {
          ecgValues.push(buffer.readInt16LE(i));
        }

        onECGData(ecgValues);
      }
    );
    console.log('📈 Abonné au flux ECG');
  } catch (error) {
    console.warn('❌ Abonnement ECG impossible');
  }
};

export const stopECG = () => {
  if (ecgSubscription) {
    ecgSubscription.remove();
    ecgSubscription = null;
    console.log('🛑 Souscription ECG arrêtée');
  }
};

export const disconnectDevice = async () => {
  if (connectedDevice) {
    try {
      await connectedDevice.cancelConnection();
      console.log('🔌 Déconnecté du Movesense');
      connectedDevice = null;
    } catch (error) {
      console.error('❌ Erreur de déconnexion :', error);
    }
  }
};

export default {
  startScan,
  connectToDevice,
  subscribeToECG,
  stopECG,
  disconnectDevice,
};
