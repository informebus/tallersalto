import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCO2ngrIv3QRdyxgk9USv4sa0b2nPlF8Fw",
  authDomain: "taller-salto.firebaseapp.com",
  databaseURL: "https://taller-salto-default-rtdb.firebaseio.com",
  projectId: "taller-salto",
  storageBucket: "taller-salto.firebasestorage.app",
  messagingSenderId: "465305239795",
  appId: "1:465305239795:web:1adb7e4471c106b9a17786",
  measurementId: "G-R3GFFVR4NV"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();
export const auth = firebase.auth();
export default firebase;
