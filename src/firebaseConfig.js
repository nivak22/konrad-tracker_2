import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAjVREwpmAAR5mybswNRseIiBHCWCednck",
  authDomain: "habbitkonrad.firebaseapp.com",
  projectId: "habbitkonrad",
  storageBucket: "habbitkonrad.appspot.com", // <- corregido aquí
  messagingSenderId: "56159078091",
  appId: "1:56159078091:web:91761ae793da9a9cc0fd4e"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db};
