import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  db
} from "../firebase";

export async function getDashboardData() {

  // HOSTS
  const hostsSnap = await getDocs(
    collection(db, "hosts")
  );

  const hosts = hostsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  // WARNINGS
  const warningsSnap = await getDocs(
    collection(db, "warnings")
  );

  const warnings = warningsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  // TOTAL HOSTS
  const totalHosts = hosts.length;

  // ATIVAS
  const activeHosts = hosts.filter(
    (host) => host.ativo !== false
  ).length;

  // INATIVAS
  const inactiveHosts = hosts.filter(
    (host) => host.ativo === false
  ).length;

  // TOTAL WARNINGS
  const totalWarnings = warnings.length;

  // RISCO ALTO
  const highRisk = warnings.filter(
    (warning) =>
      warning.gravidade === "alta"
  ).length;

  // TOTAL BEANS
  const totalBeans = hosts.reduce(
    (acc, host) =>
      acc + Number(host.beans || 0),
    0
  );

  // TOP 5
  const ranking = [...hosts]
    .sort(
      (a, b) =>
        Number(b.beans || 0) -
        Number(a.beans || 0)
    )
    .slice(0, 5);

  return {

    totalHosts,

    activeHosts,

    inactiveHosts,

    totalWarnings,

    highRisk,

    totalBeans,

    ranking

  };

}