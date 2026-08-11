/**
 * Firebase client bootstrap for public site + admin.
 * Uses the modular CDN-compatible ES module imports via import map / relative config.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig?.apiKey &&
      firebaseConfig.apiKey !== "YOUR_API_KEY" &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}

let app = null;
let auth = null;
let db = null;
let storage = null;

export function getFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy js/firebase-config.example.js to js/firebase-config.js and add your project keys."
    );
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  return { app, auth, db, storage };
}

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
};

/** Upload a file to Storage and return its download URL */
export async function uploadImage(file, path) {
  const { storage } = getFirebase();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getSiteSettings() {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "settings", "site"));
  return snap.exists() ? snap.data() : null;
}

export async function saveSiteSettings(data) {
  const { db } = getFirebase();
  await setDoc(
    doc(db, "settings", "site"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getPageContent(pageId) {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, "pages", pageId));
  return snap.exists() ? snap.data() : null;
}

export async function savePageContent(pageId, data) {
  const { db } = getFirebase();
  await setDoc(
    doc(db, "pages", pageId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function listDogs() {
  const { db } = getFirebase();
  try {
    const q = query(collection(db, "dogs"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "dogs"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function saveDog(id, data) {
  const { db } = getFirebase();
  if (id) {
    await updateDoc(doc(db, "dogs", id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const refDoc = await addDoc(collection(db, "dogs"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return refDoc.id;
}

export async function removeDog(id) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, "dogs", id));
}

export async function listPeople() {
  const { db } = getFirebase();
  try {
    const q = query(collection(db, "people"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, "people"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function savePerson(id, data) {
  const { db } = getFirebase();
  if (id) {
    await updateDoc(doc(db, "people", id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const refDoc = await addDoc(collection(db, "people"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return refDoc.id;
}

export async function removePerson(id) {
  const { db } = getFirebase();
  await deleteDoc(doc(db, "people", id));
}
