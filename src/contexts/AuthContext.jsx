import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        if (!currentUser) {

          setUser(null);

          setLoading(false);

          return;

        }

        try {

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {

            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...userSnap.data()
            });

          } else {

            setUser(null);

          }

        } catch (error) {

          console.error(error);

          setUser(null);

        }

        setLoading(false);

      }
    );

    return () => unsubscribe();

  }, []);

  return (

    <AuthContext.Provider
      value={{
        user,
        loading
      }}
    >

      {!loading && children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}