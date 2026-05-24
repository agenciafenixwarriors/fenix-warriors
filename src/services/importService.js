import * as XLSX from "xlsx";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function importExcel(file) {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data);

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  for (const row of jsonData) {
    await addDoc(collection(db, "streamers"), {
      ...row,
      createdAt: serverTimestamp(),
    });
  }

  return jsonData.length;
}