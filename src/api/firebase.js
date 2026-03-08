import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzyunK7G8hQhquVdywCxUBUxIeRKbez1M",
  authDomain: "appspese-ecee5.firebaseapp.com",
  projectId: "appspese-ecee5",
  storageBucket: "appspese-ecee5.firebasestorage.app",
  messagingSenderId: "180085366530",
  appId: "1:180085366530:web:ec55f23f096065538a6c1b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
