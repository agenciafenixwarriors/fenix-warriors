import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import app from "../firebase";

const db = getFirestore(app);

export async function saveStreamer(data) {
  try {
    await addDoc(collection(db, "streamers"), data);
  } catch (error) {
    console.error(error);
  }
}

export async function getStreamers() {
  try {
    const querySnapshot = await getDocs(collection(db, "streamers"));

    const streamers = [];

    querySnapshot.forEach((doc) => {
      streamers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return streamers;
  } catch (error) {
    console.error(error);
    return [];
  }
}