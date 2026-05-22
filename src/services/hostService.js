import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const hostsCollection = collection(db, "hosts");

export async function getHosts() {

  const snapshot = await getDocs(hostsCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addHost(hostData) {

  const existingQuery = query(
    hostsCollection,
    where("uid", "==", hostData.uid)
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return false;
  }

  await addDoc(hostsCollection, hostData);

  return true;
}