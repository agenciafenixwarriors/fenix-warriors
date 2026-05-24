import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function Members() {
  const [members, setMembers] =
    useState([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const querySnapshot =
          await getDocs(
            collection(db, "members")
          );

        const membersList = [];

        querySnapshot.forEach((doc) => {
          membersList.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setMembers(membersList);
      } catch (error) {
        console.log(error);
      }
    }

    loadMembers();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        👥 Membros Fênix
      </h1>

      <div className="grid gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-zinc-900 p-6 rounded-2xl"
          >
            <h2 className="text-3xl font-bold">
              {member.name}
            </h2>

            <p className="text-zinc-400 mt-2">
              Cargo: {member.role}
            </p>

            <p className="text-yellow-400">
              Nível: {member.level}
            </p>

            <p className="text-orange-400">
              XP: {member.points}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}