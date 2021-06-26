import { createContext, ReactNode, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { auth, firebase } from '../services/firebase';

type User = {
  id: string,
  name: string,
  avatar: string,
}

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
  signOutWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userState => {
      if (userState) {
        const { displayName, photoURL, uid } = userState

        if (!displayName || !photoURL) {
          toast.error('Faltam informações na sua conta Google!');
          throw new Error('Faltam informações na sua conta Google!');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    })
    return () => {
      unsubscribe();
    }
  }, [])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

      if (result.user) {
        const { displayName, photoURL, uid } = result.user

        if (!displayName || !photoURL) {
          toast.error('Faltam informações na sua conta Google!');
          throw new Error('Faltam informações na sua conta Google');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
  }

  async function signOutWithGoogle() {
    await auth.signOut();
    setUser(undefined);
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOutWithGoogle }}>
      {props.children}
      <Toaster />
    </AuthContext.Provider>
  )
}