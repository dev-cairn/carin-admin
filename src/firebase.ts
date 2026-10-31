import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc,
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc,
  where,
  addDoc
} from 'firebase/firestore'

// Firebase Configuration for project: cairn-browser-db
export const firebaseConfig = {
  apiKey: 'AIzaSyCchHTyzvDLXbABEo3gTTu14lX1uU6_VgA',
  authDomain: 'cairn-browser-db.firebaseapp.com',
  projectId: 'cairn-browser-db',
  storageBucket: 'cairn-browser-db.firebasestorage.app',
  messagingSenderId: '799056887289',
  appId: '1:799056887289:web:b751c72f26fabfd25a1128',
  measurementId: 'G-C442RWT34L'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc,
  where,
  addDoc
}
export type { User }
