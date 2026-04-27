import { firebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// React Native Firebase reads native config from google-services.json (Android)
// and GoogleService-Info.plist (iOS). Add those files after you create your
// Firebase project and register the app.

export const firebaseAuth = auth();
export const firebaseFirestore = firestore();

export async function signInWithEmail(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  return firebaseAuth.signInWithEmailAndPassword(email, password);
}

export async function signUpWithEmail(profile: {
  name: string;
  usn: string;
  branch: string;
  semester: string;
  year: string;
  section: string;
  phone: string;
  dob: string;
  hostel: string;
  email: string;
  password: string;
}) {
  const {
    name,
    usn,
    branch,
    semester,
    year,
    section,
    phone,
    dob,
    hostel,
    email,
    password,
  } = profile;

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email.trim(), password);
  const uid = userCredential.user.uid;
  const avatar = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('');

  await firebaseFirestore.collection('users').doc(uid).set({
    name,
    usn,
    branch,
    semester,
    year,
    section,
    phone,
    dob,
    hostel,
    email: email.trim(),
    avatar,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return userCredential;
}

export async function signOutCurrentUser() {
  return firebaseAuth.signOut();
}

export async function fetchCurrentUserProfile() {
  const user = firebaseAuth.currentUser;
  if (!user) return null;

  const doc = await firebaseFirestore.collection('users').doc(user.uid).get();
  if (!doc.exists) return null;
  return doc.data();
}
